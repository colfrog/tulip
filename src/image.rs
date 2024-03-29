use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::serde::json::Json;
use rocket::fs::TempFile;
use rocket::response::Redirect;

use rocket_sync_db_pools::rusqlite::params;

use std::io::prelude::*;
use std::fs::File;

use super::{Db, Result, User};

#[derive(Responder)]
#[response(content_type = "image/png")]
struct Image(Vec<u8>);

#[get("/all")]
async fn get_images(db: Db, _user: User) -> Option<Json<Vec<String>>> {
    let images: Vec<String> = db.run(move |conn| {
	conn.prepare("SELECT id FROM images WHERE username = ?1")?
	    .query_map(params![_user.0], |row| row.get(0))?
	    .collect::<Result<Vec<String>, _>>()
    }).await.ok()?;

    Some(Json(images))
}

#[get("/<id>")]
async fn get_image(db: Db, _user: User, id: String) -> Option<Image> {
    let image: Image = db.run(move |conn| {
	conn.query_row("SELECT image FROM images WHERE username = ?1 AND id = ?2",
		     params![_user.0, id],
		     |row| Ok(Image(row.get(0)?)))
    }).await.ok()?;

    Some(image)
}

#[post("/<id>", data = "<image>")]
async fn post_image(db: Db, _user: User, id: String, image: Vec<u8>) -> Option<String> {
    if !_user.1 {
	return None
    }
    
    let db_id = id.clone();
    db.run(move |conn| {
	conn.execute("INSERT INTO images (username, id, image) VALUES (?1, ?2, ?3)",
		     params![_user.0, db_id, image])
    }).await.ok()?;

    Some(format!("/i/{}", id))
}

#[derive(FromForm)]
struct ImageForm<'r> {
    #[field(name = "imageID")]
    id: &'r str,
    #[field(name = "imageFile")]
    file: TempFile<'r>
}

#[post("/", data = "<image>")]
async fn post_image_form(db: Db, _user: User, image: Form<ImageForm<'_>>) -> Option<String> {
    if !_user.1 {
	return None
    }

    let id = image.id.to_string();
    let mut file = File::open(image.file.path().unwrap()).ok()?;
    let mut content = Vec::new();
    file.read_to_end(&mut content).ok()?;
    db.run(move |conn| {
	conn.execute("INSERT INTO images (username, id, image) VALUES (?1, ?2, ?3)",
		     params![_user.0, id, content])
    }).await.ok()?;

    Some(format!("/i/{}", image.id))
}

#[delete("/<id>")]
async fn delete_image(db: Db, _user: User, id: String) -> Option<Redirect> {
    if !_user.1 {
	return None
    }

    let db_id = id.clone();
    db.run(move |conn| {
	conn.execute("DELETE FROM images WHERE username = ?1 AND id = ?2",
		     params!(_user.0, db_id))
    }).await.ok()?;

    Some(Redirect::to("/images"))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Image Stage", |rocket| async {
        rocket.mount("/i", routes![get_images, get_image, post_image, delete_image, post_image_form])
    })
}

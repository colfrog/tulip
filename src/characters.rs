use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::serde::{Serialize, Deserialize, json::Json};
use rocket::response::Redirect;

use rocket_sync_db_pools::rusqlite::params;
use markdown_to_html::markdown;

use super::{Db, Result, User};

#[derive(FromForm, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Character {
    #[field(name = "name")]
    name: String,
    #[field(name = "description")]
    description: String,
    #[field(name = "image")]
    image: String,
}

#[derive(FromForm, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct CharacterImage {
    #[field(name = "name")]
    name: String,
    #[field(name = "image-id")]
    image: String,
}

#[get("/all")]
async fn characters(db: Db, username: User) -> Result<Json<Vec<Character>>> {
    let characters = db.run(move |conn| {
	conn.prepare("SELECT charname, description, image FROM characters WHERE username = ?1 ORDER BY charname ASC")?
	    .query_map(params![username.0], |row| {
		let description_md: String = row.get(1)?;
		let description = markdown(&(description_md + "\n"));
		Ok(Character {
		    name: row.get(0)?,
		    description,
		    image: row.get(2)?
		})
	    })?
	    .collect::<Result<Vec<Character>, _>>()
    }).await?;

    Ok(Json(characters))
}

#[get("/<name>")]
async fn character(db: Db, username: User, name: String) -> Option<Json<Character>> {
    let character = db.run(move |conn| {
	conn.query_row("SELECT charname, description, image FROM characters WHERE username = ?1 AND charname = ?2", params![username.0, name],
		       |r| Ok(Character {
			   name: r.get(0)?,
			   description: r.get(1)?,
			   image: r.get(2)?
		       }))
    }).await.ok()?;

    Some(Json(character))
}

#[get("/images/<name>")]
async fn character_images(db: Db, username: User, name: String) -> Result<Json<Vec<String>>> {
    let images = db.run(move |conn| {
	conn.prepare("SELECT image FROM character_images WHERE username = ?1 AND charname = ?2 ORDER BY charname ASC")?
	    .query_map(params![username.0, name], |row| {
		Ok(row.get(0)?)
	    })?
	    .collect::<Result<Vec<String>, _>>()
    }).await?;

    Ok(Json(images))
}

#[post("/images/new", data = "<image>")]
async fn add_image_to_character(db: Db, username: User, image: Form<CharacterImage>) -> Option<Redirect> {
    if !username.1 {
	return None;
    }

    db.run(move |conn| {
	let _ = conn.execute("INSERT INTO character_images (username, charname, image) VALUES (?1, ?2, ?3)", params![username.0, image.name, image.image]);
    }).await;

    Some(Redirect::to("/characters"))
}

#[post("/new", data = "<character>")]
async fn new_character_form(db: Db, username: User, character: Form<Character>) -> Option<Redirect> {
    if !username.1 {
	return None
    }
    
    db.run(move |conn| {
	let _ = conn.execute("INSERT INTO characters (username, charname, description, image) VALUES (?1, ?2, ?3, ?4)", params![username.0, character.name, character.description, character.image]);
    }).await;

    Some(Redirect::to("/characters"))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Characters Stage", |rocket| async {
        rocket.mount("/characters", routes![characters, character, character_images, add_image_to_character, new_character_form])
    })
}

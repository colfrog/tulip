use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::serde::{Serialize, Deserialize, json::Json};

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

#[get("/all")]
async fn characters(db: Db, username: User) -> Result<Json<Vec<Character>>> {
    let characters = db.run(move |conn| {
	conn.prepare("SELECT charname, description, image FROM characters WHERE username = ?1 ORDER BY charname DESC")?
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

#[post("/new", data = "<character>")]
async fn new_character_form(db: Db, username: User, character: Form<Character>) -> Option<Json<Character>> {
    println!("{}", character.name);
    let result = db.run(move |conn| {
	let _ = conn.execute("INSERT INTO characters (username, charname, description, image) VALUES (?1, ?2, ?3, ?4);", params![username.0, character.name, character.description, character.image]);
	conn.query_row("SELECT charname, description, image FROM characters WHERE username = ?1 AND charname = ?2 AND description = ?3",
		       params![username.0, character.name, character.description], |row| Ok(Character {
			   name: row.get(0)?,
			   description: row.get(1)?,
			   image: row.get(2)?
		       }))
    }).await.ok()?;

    Some(Json(result))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Portfolio Stage", |rocket| async {
        rocket.mount("/characters", routes![characters, character, new_character_form])
    })
}

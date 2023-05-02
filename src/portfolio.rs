use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_sync_db_pools::rusqlite::params;

use super::{Db, Result, User};

#[derive(FromForm, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Entry {
    #[field(name = "category")]
    category: String,
    #[field(name = "image-id")]
    image_id: String
}

#[get("/all")]
async fn portfolio(db: Db, username: User) -> Result<Json<Vec<Entry>>> {
    let characters = db.run(move |conn| {
	conn.prepare("SELECT category, image FROM portfolio WHERE username = ?1 ORDER BY category")?
	    .query_map(params![username.0], |row| {
		Ok(Entry {
		    category: row.get(0)?,
		    image_id: row.get(1)?
		})
	    })?
	    .collect::<Result<Vec<Entry>, _>>()
    }).await?;

    Ok(Json(characters))
}

// TODO: Make this redirect to the portfolio
#[post("/new", data = "<entry>")]
async fn add_to_portfolio(db: Db, username: User, entry: Form<Entry>) -> Option<Json<Entry>> {
    let result = db.run(move |conn| {
	let _ = conn.execute("INSERT INTO portfolio (username, category, image) VALUES (?1, ?2, ?3)",
 			     params![username.0, entry.category, entry.image_id]);
	conn.query_row("SELECT category, image FROM portfolio WHERE username = ?1 AND image = ?2 AND category = ?3",
		       params![username.0, entry.image_id, entry.category], |row| Ok(Entry {
			   category: row.get(0)?,
			   image_id: row.get(1)?
		       }))
    }).await.ok()?;

    Some(Json(result))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Portfolio Stage", |rocket| async {
        rocket.mount("/portfolio", routes![portfolio, add_to_portfolio])
    })
}

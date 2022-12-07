use rocket::fairing::AdHoc;
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_sync_db_pools::rusqlite::params;

use super::{Db, Result, User};

#[derive(Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Entry {
    category: String,
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

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Portfolio Stage", |rocket| async {
        rocket.mount("/portfolio", routes![portfolio])
    })
}

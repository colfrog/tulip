use rocket::response::content::RawHtml;
use rocket::fairing::AdHoc;

use rocket_sync_db_pools::rusqlite::params;
use markdown_to_html::markdown;

use super::Db;

#[get("/<username>?<content_type>")]
async fn home(db: Db, username: &str, content_type: &str) -> Option<RawHtml<String>> {
    let username: String = username.to_string();
    let content: String = db.run(move |conn| {
	conn.query_row("SELECT markdown FROM home WHERE username = ?1",
		       params![&username], |r| r.get(0))
    }).await.ok()?;

    if content_type.eq("html") {
	// Serve HTML if requested
	let content = markdown(&(content + "\n"));
	Some(RawHtml(content))
    } else {
	// Default to Markdown
	Some(RawHtml(content))
    }
}

#[put("/<username>", data = "<content>")]
async fn update_home(db: Db, username: &str, content: &str) -> Option<RawHtml<String>> {
    let username: String = username.to_string();
    let db_content: String = content.to_string();
    let affected = db.run(move |conn| {
	conn.execute("UPDATE home SET markdown = ?1 WHERE username = ?2",
		     params![db_content, username])
    }).await;

    let updated: bool = match affected {
	Ok(updated) => updated == 1,
	Err(err) => {println!("update failed: {}", err); false}
    };

    if updated {
	Some(RawHtml(content.to_string()))
    } else {
	None
    }
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Home Stage", |rocket| async {
        rocket.mount("/home", routes![home, update_home])
    })
}

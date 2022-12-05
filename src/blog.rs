use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::response::content::RawHtml;
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_sync_db_pools::rusqlite::params;
use markdown_to_html::markdown;

use super::{Db, Result, User};

#[derive(FromForm, Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Post {
    id: Option<u64>,
    #[field(name = "title")]
    title: String,
    submitted: Option<String>,
    #[field(name = "text")]
    markdown: Option<String>
}

#[get("/<username>")]
async fn blog_posts(db: Db, username: String) -> Result<Json<Vec<Post>>> {
    let posts = db.run(move |conn| {
	conn.prepare("SELECT id, title, submitted FROM posts WHERE username = ?1 ORDER BY submitted DESC")?
	    .query_map(params![username], |row| Ok(Post {
		id: Some(row.get(0)?),
		title: row.get(1)?,
		submitted: Some(row.get(2)?),
		markdown: None
	    }))?
	    .collect::<Result<Vec<Post>, _>>()
    }).await?;

    Ok(Json(posts))
}

#[get("/<username>/<id>")]
async fn blog_post(db: Db, username: String, id: u64) -> Option<RawHtml<String>> {
    let content: Post = db.run(move |conn| {
	conn.query_row("SELECT title, submitted, markdown FROM posts WHERE username = ?1 AND id = ?2", params![username, id],
		       |r| Ok(Post {
			   id: Some(id),
			   title: r.get(0)?,
			   submitted: r.get(1)?,
			   markdown: Some(r.get(2)?)
		       }))
    }).await.ok()?;

    Some(RawHtml(markdown(&(content.markdown? + "\n"))))
}

#[post("/<username>", data = "<post>")]
async fn new_blog_post(db: Db, username: String, post: Json<Post>) -> Option<Json<Post>> {
    let db_post = post.clone();
    db.run(move |conn| {
	conn.execute("INSERT INTO posts (username, title, markdown) VALUES (?1, ?2, ?3);", params![username, db_post.title, db_post.markdown])
    }).await.ok()?;

    Some(post)
}

#[post("/new", data = "<post>")]
async fn new_blog_post_form(db: Db, username: User, post: Form<Post>) -> Option<Json<Post>> {
    let db_title = post.title.clone();
    let db_markdown = post.markdown.clone();
    let result = db.run(move |conn| {
	let _ = conn.execute("INSERT INTO posts (username, title, markdown) VALUES (?1, ?2, ?3);", params![username.0, db_title, db_markdown]);
	conn.query_row("SELECT id, title, submitted, markdown FROM posts WHERE username = ?1 AND title = ?2 AND markdown = ?3",
		       params![username.0, db_title, db_markdown], |row| Ok(Post {
			   id: Some(row.get(0)?),
			   title: row.get(1)?,
			   submitted: row.get(2)?,
			   markdown: row.get(3)?
		       }))
    }).await.ok()?;

    Some(Json(result))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Blog Stage", |rocket| async {
        rocket.mount("/blog", routes![blog_posts, blog_post, new_blog_post, new_blog_post_form])
    })
}

use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::response::content::RawHtml;
use rocket::response::Redirect;
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

#[get("/<id>?<content_type>")]
async fn blog_post(db: Db, user: User, id: u64, content_type: &str) -> Option<RawHtml<String>> {
    let username: String = user.0.to_string();
    let content: Post = db.run(move |conn| {
	conn.query_row("SELECT title, submitted, markdown FROM posts WHERE username = ?1 AND id = ?2", params![username, id],
		       |r| Ok(Post {
			   id: Some(id),
			   title: r.get(0)?,
			   submitted: r.get(1)?,
			   markdown: Some(r.get(2)?)
		       }))
    }).await.ok()?;

    if content_type.eq("html") {
	Some(RawHtml(markdown(&(content.markdown? + "\n"))))
    } else {
	Some(RawHtml(content.markdown?))
    }
}

#[post("/<username>", data = "<post>")]
async fn new_blog_post(db: Db, _user: User, username: String, post: Json<Post>) -> Option<Redirect> {
    if !_user.1 {
	return None
    }
    
    let db_post = post.clone();
    db.run(move |conn| {
	conn.execute("INSERT INTO posts (username, title, markdown) VALUES (?1, ?2, ?3);", params![username, db_post.title, db_post.markdown])
    }).await.ok()?;

    Some(Redirect::to("/blog"))
}

#[post("/new", data = "<post>")]
async fn new_blog_post_form(db: Db, username: User, post: Form<Post>) -> Option<Redirect> {
    if !username.1 {
	return None
    }
    
    let db_title = post.title.clone();
    let db_markdown = post.markdown.clone();
    let _result = db.run(move |conn| {
	let _ = conn.execute("INSERT INTO posts (username, title, markdown) VALUES (?1, ?2, ?3);", params![username.0, db_title, db_markdown]);
	conn.query_row("SELECT id, title, submitted, markdown FROM posts WHERE username = ?1 AND title = ?2 AND markdown = ?3",
		       params![username.0, db_title, db_markdown], |row| Ok(Post {
			   id: Some(row.get(0)?),
			   title: row.get(1)?,
			   submitted: row.get(2)?,
			   markdown: row.get(3)?
		       }))
    }).await.ok()?;

    Some(Redirect::to("/blog"))
}

#[put("/<id>", data = "<content>")]
async fn update_post(db: Db, user: User, id: u64, content: &str) -> Option<RawHtml<String>> {
    if !user.1 {
	return None
    }
    
    let username: String = user.0.to_string();
    let db_content: String = content.to_string();
    let affected = db.run(move |conn| {
	conn.execute("UPDATE posts SET markdown = ?1 WHERE username = ?2 AND id = ?3",
		     params![db_content, username, id])
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

#[delete("/<id>")]
async fn delete_post(db: Db, user: User, id: u64) -> Option<Redirect> {
    if !user.1 {
	return None
    }

    let username: String = user.0.to_string();
    let _affected = db.run(move |conn| {
	conn.execute("DELETE FROM posts WHERE username = ?1 AND id = ?2",
		     params![username, id])
    }).await;

    Some(Redirect::to("/blog"))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Blog Stage", |rocket| async {
        rocket.mount("/blog", routes![blog_posts, blog_post, new_blog_post, new_blog_post_form, update_post, delete_post])
    })
}

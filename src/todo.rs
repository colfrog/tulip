use rocket::fairing::AdHoc;
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_sync_db_pools::rusqlite::params;

use super::{Db, Result, User};

#[derive(Clone, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Todo {
    id: u64,
    text: String,
    done: bool
}

#[get("/")]
async fn get_todo(db: Db, username: User) -> Result<Json<Vec<Todo>>> {
    let todo_list = db.run(move |conn| {
	conn.prepare("SELECT id, text, done FROM todo WHERE username = ?1 ORDER BY id ASC")?
	    .query_map(params![username.0], |row| Ok(Todo {
		id: row.get(0)?,
		text: row.get(1)?,
		done: row.get(2)?
	    }))?
	    .collect::<Result<Vec<Todo>, _>>()
    }).await?;

    Ok(Json(todo_list))
}

#[post("/", data = "<text>")]
async fn new_todo(db: Db, username: User, text: String) -> Option<Json<Todo>> {
    if !username.1 {
	return None
    }
    
    let db_text = text.clone();
    let db_username = username.0.clone();
    let todo = db.run(move |conn| {
	let _ = conn.execute("INSERT INTO todo (username, text) VALUES (?1, ?2)", params![db_username, db_text]);
	conn.query_row("SELECT id, text, done FROM todo WHERE username = ?1 AND text = ?2 ORDER BY id ASC",
	    params![db_username, db_text], |row| Ok(Todo {
		id: row.get(0)?,
		text: row.get(1)?,
		done: row.get(2)?
	    }))
    }).await.ok()?;

    Some(Json(todo))
}

#[put("/", data = "<todo>")]
async fn update_todo(db: Db, username: User, todo: Json<Todo>) -> Option<Json<Todo>> {
    if !username.1 {
	return None
    }
    
    let db_todo = todo.clone();
    println!("{} {} {}", todo.id, todo.text, todo.done);
    let result = db.run(move |conn| {
	let _ = conn.execute("UPDATE todo SET text = ?1, done = ?2 WHERE username = ?3 AND id = ?4", params![db_todo.text, true, username.0, db_todo.id]);
	conn.query_row("SELECT id, text, done FROM todo WHERE username = ?1 AND id = ?2 ORDER BY id ASC",
	    params![username.0, db_todo.id], |row| Ok(Todo {
		id: row.get(0)?,
		text: row.get(1)?,
		done: row.get(2)?
	    }))
    }).await.ok()?;

    println!("{}", result.done);
    Some(Json(result))
}

#[delete("/", data = "<id>")]
async fn delete_todo(db: Db, username: User, id: String) -> Option<&'static str> {
    if !username.1 {
	return None
    }
    
    db.run(move |conn| {
	conn.execute("DELETE FROM todo WHERE username = ?1 AND id = ?2", params![username.0, id])
    }).await.ok()?;

    Some("done")
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Todo Stage", |rocket| async {
        rocket.mount("/todo", routes![get_todo, new_todo, update_todo, delete_todo])
    })
}

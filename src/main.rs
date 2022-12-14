#[macro_use] extern crate rocket;

use rocket::{Rocket, Build};
use rocket::fairing::AdHoc;
use rocket::fs::NamedFile;
use rocket::form::{Form, FromForm};
use rocket::http::{Status, Cookie, CookieJar};
use rocket::response::{Debug, Redirect};
use rocket::Request;
use rocket::request;
use rocket::request::Outcome;
use rocket::request::FromRequest;

use rocket_sync_db_pools::{rusqlite, database};
use rocket_dyn_templates::{Template, context};
use self::rusqlite::params;

use std::fs;
use std::path::{PathBuf, Path};

#[database("db")]
pub struct Db(rusqlite::Connection);
pub type Result<T, E = Debug<rusqlite::Error>> = std::result::Result<T, E>;

mod blog;
mod home;
mod image;
mod todo;
mod characters;
mod portfolio;

#[derive(Debug)]
enum UsernameError {
    Undefined
}

struct User(String, bool);
#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = UsernameError;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let host = request.headers().get_one("Host");
	let authenticated = request.cookies()
	    .get_private("authenticated")
	    .and_then(|cookie| Some(cookie.value() == "1"))
	    .unwrap_or(false);
        match host {
          Some(host) => {
              // check validity
	      let host = host.to_string();
	      let username: String;
	      if host.starts_with("localhost") {
		  username = "laurent".to_string();
	      } else if host.starts_with("127.0.0.1") {
		  username = "raven".to_string();
	      } else {
		  username = "undefined".to_string();
	      }
	      
              Outcome::Success(User(username, authenticated))
          },
          // token does not exist
          None => Outcome::Failure((Status::Unauthorized, UsernameError::Undefined))
        }
    }
}

#[derive(FromForm)]
struct LoginForm<'r> {
    username: &'r str,
    password: &'r str
}

#[post("/login", data = "<login>")]
async fn login(db: Db, user: User, jar: &CookieJar<'_>, login: Form<LoginForm<'_>>) -> Option<Redirect> {
    let username = login.username.to_string();
    let password: String = db.run(move |conn| {
	conn.query_row("SELECT password FROM users WHERE username = ?1",
		       params![username], |row| Ok(row.get(0)?))
    }).await.ok()?;

    if password == login.password {
	jar.add_private(Cookie::new("authenticated", "1"));
    }
    
    Some(Redirect::to("/"))
}

#[get("/logout")]
fn logout(jar: &CookieJar<'_>) -> Redirect {
    jar.remove_private(Cookie::named("authenticated"));
    Redirect::to("/")
}

#[get("/")]
async fn get_home(user: User) -> Template {
    Template::render(user.0 + "/home", context! {
	logged_in: user.1
    })
}

#[get("/<template>")]
async fn get_template(user: User, template: &str) -> Template {
    Template::render(user.0 + "/" + template, context! {
	logged_in: user.1
    })
}

#[get("/<path..>", rank = 1)]
async fn public(user: User, path: PathBuf) -> Option<NamedFile> {
    let mut path = Path::new(&("public/".to_owned() + &user.0)).join(path);
    if path.is_dir() {
        path.push("index.html");
    }

    NamedFile::open(path).await.ok()
}

#[launch]
fn rocket() -> _ {
    rocket::build()
	.attach(Db::fairing())
	.attach(Template::fairing())
        .attach(AdHoc::on_ignite("Init DB", init_db))
	.attach(home::stage())
	.attach(blog::stage())
	.attach(image::stage())
	.attach(todo::stage())
	.attach(characters::stage())
	.attach(portfolio::stage())
	.mount("/", routes![login, logout, get_home, get_template, public])
}

async fn init_db(rocket: Rocket<Build>) -> Rocket<Build> {
    Db::get_one(&rocket).await
	.expect("Can't mount DB")
        .run(|conn| {
	    let create_tables = fs::read_to_string("db/create_tables.sql")
		.expect("Failed to open db/create_tables.sql");
	    let query_list = create_tables.trim().split(";");
	    for query in query_list {
		if query.is_empty() {
		    continue;
		}
		
		println!("{}", query);
		conn.execute(&query, params![])
		    .expect(&format!("Query Failed\n{}", &query));
	    }
        }).await;

    rocket
}

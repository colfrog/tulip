#[macro_use] extern crate rocket;

use rocket::{Rocket, Build};
use rocket::fairing::AdHoc;
use rocket::fs::NamedFile;
use rocket::http::Status;
use rocket::response::Debug;
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

#[derive(Debug)]
enum UsernameError {
    Undefined
}

struct User(String);
#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = UsernameError;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let host = request.headers().get_one("Host");
        match host {
          Some(host) => {
              // check validity
	      let host = host.to_string();
	      let mut username = String::new();
	      if host.starts_with("localhost") {
		  username = "laurent".to_string();
	      } else if host.starts_with("127.0.0.1") {
		  username = "raven".to_string();
	      } else {
		  username = "undefined".to_string();
	      }
	      
              Outcome::Success(User(username))
          },
          // token does not exist
          None => Outcome::Failure((Status::Unauthorized, UsernameError::Undefined))
        }
    }
}

#[get("/user")]
fn get_user(username: User) -> String {
    username.0
}

#[get("/")]
async fn get_home(username: User) -> Template {
    Template::render(username.0 + "/home", context! {
    })
}

#[get("/blog")]
async fn get_blog() -> Template {
    Template::render("laurent/blog", context! {
    })
}

#[get("/edit")]
async fn get_edit() -> Template {
    Template::render("raven/edit", context! {
    })
}

#[get("/characters")]
async fn get_characters() -> Template {
    Template::render("raven/characters", context! {
    })
}

#[get("/portfolio")]
async fn get_portfolio() -> Template {
    Template::render("raven/portfolio", context! {
    })
}

#[get("/<path..>", rank = 1)]
async fn public(username: User, path: PathBuf) -> Option<NamedFile> {
    let mut path = Path::new(&("public/".to_owned() + &username.0)).join(path);
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
	.mount("/", routes![get_user, get_home, get_blog, get_edit, get_characters, get_portfolio, public])
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

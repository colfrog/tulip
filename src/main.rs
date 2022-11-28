#[macro_use] extern crate rocket;

use rocket::{Rocket, Build};
use rocket::fairing::AdHoc;
use rocket::fs::NamedFile;
use rocket::response::Debug;

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

#[get("/")]
async fn get_home() -> Template {
    Template::render("laurent/home", context! {
    })
}

#[get("/blog")]
async fn get_blog() -> Template {
    Template::render("laurent/blog", context! {
    })
}

#[get("/edit")]
async fn get_edit() -> Template {
    Template::render("laurent/edit", context! {
    })
}

#[get("/<path..>", rank = 1)]
async fn public(path: PathBuf) -> Option<NamedFile> {
    let mut path = Path::new("public").join(path);
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
	.mount("/", routes![get_home, get_blog, get_edit, public])
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

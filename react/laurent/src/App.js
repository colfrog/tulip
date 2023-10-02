import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';

import { Home } from './Home';
import { Edit } from './Edit';
import { Blog } from './Blog';
import { NewPost } from './NewPost';
import { Images } from './Images';
import { Upload } from './Upload';
import { Login, Logout } from './Login';

const loggedIn = true;

function Header() {
    let loginLink = "/logout";
    if (!loggedIn)
        loginLink = "/login";

    return (
        <header>
          <Link to={loginLink}>
	    <img src="/images/head.jpg" alt="My face" />
          </Link>
          <div id="headerText">
	    <h1>Laurent</h1>
	    <h4>Full-Stack Developer</h4>
	    <p>Rust | C++ | Python | React | Node.js</p>
          </div>
          <div id="icons">
	    <a href="https://github.com/colfrog">
	      <img src="/images/Github Mark.png" alt="Github" />
	    </a>
          </div>
        </header>
    );
}

function Navigation() {
    let location = useLocation();
    let isActivePath = (path) => location.pathname === path ? 'activated' : '';
    let isInPaths = (paths) => paths.includes(location.pathname);

    let edit = null;
    if (loggedIn && isInPaths(["/", "/edit"]))
        edit = <Link className={isActivePath("/edit")} to="/edit">Edit</Link>;

    let newPost = null;
    if (loggedIn && isInPaths(["/blog", "/new"]))
        newPost = <Link className={isActivePath("/new")} to="/new">New</Link>;

    let images = null;
    if (loggedIn)
        images = <Link className={isActivePath("/images")} to="/images">Images</Link>;

    let upload = null;
    if (loggedIn && isInPaths(["/images", "/upload"]))
        upload = <Link className={isActivePath("/upload")} to="/upload">Upload</Link>;

    return (
        <nav>
          <Link className={isActivePath("/")} to="/">Home</Link>
          {edit}
          <Link className={isActivePath("/blog")} to="/blog">Blog</Link>
          {newPost}
          {images}
          {upload}
        </nav>
    );
}

function Footer() {
    return (
        <footer>Created by Laurent Cimon</footer>
    );
}

function App() {
    return (
        <BrowserRouter>
          <Header />
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/new" element={<NewPost />} />
            <Route path="/images" element={<Images />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
          <Footer />
        </BrowserRouter>
    );
}

export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom';

import { Home } from './Home';
import { Edit } from './Edit';
import { Characters } from './Characters';
import { NewCharacter } from './NewCharacter';
import { Portfolio } from './Portfolio';
import { Images } from './Images';
import { Upload } from './Upload';
import { Login } from './Login';

const loggedIn = true;

function Navigation() {
    let location = useLocation();
    let isActivePath = (path) => location.pathname === path ? 'activated' : '';
    let isInPaths = (paths) => paths.includes(location.pathname);

    let login = null;
    /*if (loggedIn)
        login = <Link className={isActivePath("/logout")} to="/logout">Log out</Link>;
    else*/
        login = <Link className={isActivePath("/login")} to="/login">Log in</Link>;

    let edit = null;
    if (loggedIn && isInPaths(["/", "/edit"]))
        edit = <Link className={isActivePath("/edit")} to="/edit">Edit</Link>;

    let newCharacter = null;
    if (loggedIn && isInPaths(["/characters", "/new-character"]))
        newCharacter = <Link className={isActivePath("/new-character")}
                             to="/new-character">New Character</Link>;
    
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
	  <Link className={isActivePath("/characters")} to="/characters">Characters</Link>
          {newCharacter}
	  <Link className={isActivePath("/portfolio")} to="/portfolio">Portfolio</Link>
	  {images}
          {upload}
          {login}
        </nav>
    );
}

function Header() {
    let location = useLocation();
    let isInPaths = (paths) => paths.includes(location.pathname);

    let defaultHeader = {};
    let characterHeader = {
        backgroundImage: "none",
        backgroundColor: "pink"
    };
    let portfolioHeader = {
        backgroundImage: "none",
        backgroundColor: "#1a262f"
    };

    let headerStyle = defaultHeader;
    if (isInPaths(["/characters", "/new-character"]))
        headerStyle = characterHeader;
    else if (isInPaths(["/portfolio"]))
        headerStyle = portfolioHeader;

    return (
        <header style={headerStyle}>
          <h1>Raven</h1>
          <Navigation />
        </header>
    );
}

function App() {
    return (
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/new-character" element={<NewCharacter />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/images" element={<Images />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
    );
}

export default App;

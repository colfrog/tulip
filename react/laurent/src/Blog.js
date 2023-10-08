import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { postURL } from './postURL';
import './blog.css';

function Post({post, currentPost, loggedIn}) {
    let [content, setContent] = useState('');
    let [showContent, setShowContent] = useState(false);
    let fetchContent = () => {
        fetch(`/blog/${post.id}?content_type=html`)
	    .then(response => response.text())
	    .then(html => setContent(html));
    };
    let togglePost = () => {
        setShowContent(!showContent);
        if (!content)
            fetchContent();
    };

    useEffect(() => {
        if (currentPost === post.title) {
            setShowContent(true);
            if (!content)
                fetchContent();
        } else {
            setShowContent(false);
        }
    }, [currentPost]);

    useEffect(() => {
        if (!showContent && window.location.href.endsWith(`#${postURL(post.title)}`)) {
            setShowContent(true);
            fetchContent();
        }
    }, []);

    let buttons = null;
    if (loggedIn) {
        let deletePost = () => fetch(`/blog/${post.id}`, {method: "DELETE"})
            .then(response => window.location.reload(false));
        buttons = <>
                    <Link to={`/edit?post=${post.id}`}>
                      <button className="post-button">edit</button>
                    </Link>
                    <button className="post-button" onClick={deletePost}>delete</button>
                  </>;
    }

    let article = null;
    if (showContent)
        article = <article className="post-content">
                    <div dangerouslySetInnerHTML={{ __html: content }}>
                    </div>
                    <div style={{
                        textAlign: "right"
                    }}>{buttons}</div>
                  </article>;
    
    useEffect(() => {
        if (showContent)
            window.location.href = `#${postURL(post.title)}`;
    });

    return (
        <div id={postURL(post.title)} className="post">
          <h1 onClick={togglePost}>{post.title}</h1>
          <h5>{post.submitted}</h5>
          {article}
        </div>
    );
}

export function Blog({loggedIn}) {
    let [asideList, setAsideList] = useState([]);
    let [postList, setPostList] = useState([]);
    let [postObjList, setPostObjList] = useState([]);
    let [currentPost, setCurrentPost] = useState('');
    let [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const togglePost = (title) => {
        if (currentPost !== title)
            setCurrentPost(`${title}`);
        else
            setCurrentPost('');
    };

    const buildPostList = (posts) => {
        let list = [];
        let sideList = [];
	posts.forEach(post => {
            list.push(<Post post={post} currentPost={currentPost} key={post.id} loggedIn={loggedIn} />);
	    sideList.push(<h5 onClick={() => togglePost(post.title)} key={post.id}>{post.title}</h5>);
	});

        setPostList(list);
        setAsideList(sideList);
    };

    useEffect(() => {
        fetch("/blog/laurent")
	    .then(response => response.json())
	    .then(json => {
                buildPostList(json);
                setPostObjList(json);
	    });
    }, []);
    useEffect(() => buildPostList(postObjList), [currentPost, loggedIn]);

    return (
        <main id="blog-main">
          <aside id="blog-aside">{asideList}</aside>
          <div id="blog-content">
            {postList}
          </div>
        </main>
    );
}

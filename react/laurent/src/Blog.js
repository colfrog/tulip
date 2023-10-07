import { useState, useEffect } from 'react';

import { postURL } from './postURL';
import './blog.css';

function Post(props) {
    let [content, setContent] = useState('');
    let [showContent, setShowContent] = useState(false);
    let fetchContent = () => {
        fetch(`/blog/laurent/${props.post.id}`)
	    .then(response => response.text())
	    .then(html => setContent(html));
    };
    let togglePost = () => {
        setShowContent(!showContent);
        if (!content)
            fetchContent();
    };

    useEffect(() => {
        if (props.currentPost === props.post.title) {
            setShowContent(true);
            if (!content)
                fetchContent();
        } else {
            setShowContent(false);
        }
    }, [props.currentPost]);

    useEffect(() => {
        if (!showContent && window.location.href.endsWith(`#${postURL(props.post.title)}`)) {
            setShowContent(true);
            fetchContent();
        }
    }, []);

    let article = null;
    if (showContent)
        article = <article className="post-content"
                           dangerouslySetInnerHTML={{ __html: content }}>
                  </article>;

    useEffect(() => {
        if (showContent)
            window.location.href = `#${postURL(props.post.title)}`;
    });

    return (
        <div id={postURL(props.post.title)} className="post">
          <h1 onClick={togglePost}>{props.post.title}</h1>
          <h5>{props.post.submitted}</h5>
          {article}
        </div>
    );
}

export function Blog() {
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
            list.push(<Post post={post} currentPost={currentPost} key={post.id} />);
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
    useEffect(() => buildPostList(postObjList), [currentPost]);

    return (
        <main id="blog-main">
          <aside id="blog-aside">{asideList}</aside>
          <div id="blog-content">
            {postList}
          </div>
        </main>
    );
}

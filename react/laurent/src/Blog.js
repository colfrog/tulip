import { useState } from 'react';

import { postURL } from './postURL';
import './blog.css';

function Post(props) {
    let [content, setContent] = useState('');
    let [showContent, setShowContent] = useState(false);
    let togglePost = () => {
        if (showContent)
	    window.location.href = `#${props.post.id}`;
        else if (!content) {
            fetch(`/blog/laurent/${props.post.id}`)
		.then(response => response.text())
		.then(html => {
                    setContent(html);
		    window.location.href = `#${props.post.id}`;
		});
        }
        
        setShowContent(!showContent);
    };

    if (window.location.href.endsWith(`#${postURL(props.post.title)}`))
	togglePost();

    let article = null;
    if (showContent && content)
        article = <article className="post-content"
                           dangerouslySetInnerHTML={{ __html: content }}>
                  </article>;

    return (
        <div id={postURL(props.post.title)} className="post">
          <h1 onclick={togglePost(props.post.id)}>${props.post.title}</h1>
          <h5>${props.post.submitted}</h5>
          {article}
        </div>
    );
}

export function Blog() {
    let [asideList, setAsideList] = useState([]);
    let [postList, setPostList] = useState([]);
    let togglePost = (title) => {
        window.location.href = `#${postURL(title)}`;
    };

    fetch("/blog/laurent")
	.then(response => response.json())
	.then(json => {
            let list = [];
            let sideList = [];
	    json.forEach(post => {
                list.append(<Post post={post} key={post.id} />);
		sideList.append(<h5 onclick={togglePost(post.title)} key={post.id}>${post.title}</h5>);
	    });

            setPostList(list);
            setAsideList(sideList);
	});
    
    return (
        <main id="blog-main">
          <aside>{asideList}</aside>
          <div id="blog-content">
            {postList}
          </div>
        </main>
    );
}

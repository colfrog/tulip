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
    let [postTitles, setPostTitles] = useState([]);
    let [postList, setPostList] = useState([]);

    fetch("/blog/laurent")
	.then(response => response.json())
	.then(json => {
	    let blogContent = document.querySelector("#blog-content");
	    let aside = document.querySelector("aside");
	    json.forEach(post => {
		blogContent.innerHTML += `
<div id="${postURL(post.title)}" class="post post${post.id}">
  <h1 onclick="togglePost(${post.id})">${post.title}</h1>
  <h5>${post.submitted}</h5>
</div>
`;
		aside.innerHTML += `<h5 onclick="togglePost(${post.id})">${post.title}</h5>`;
	    });

	    return json;
	})
	.then(json => {
	    json.forEach(post => {
		if (window.location.href.endsWith(`#${postURL(post.title)}`))
		    togglePost(post.id);
	    });
	});
    
    return (
        <main>
          <aside></aside>
          <div id="blog-content">
          </div>
        </main>
    );
}

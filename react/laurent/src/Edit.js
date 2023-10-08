import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function Edit() {
    const [searchParams] = useSearchParams();
    let [content, setContent] = useState('');
    let [postId, setPostId] = useState(null);

    useEffect(() => {
        let id = searchParams.get("post") || null;
        if (id)
            fetch(`blog/${id}?content_type=markdown`)
            .then(response => response.text())
            .then(text => setContent(text));
        else
            fetch("/home/laurent?content_type=markdown")
            .then(response => response.text())
            .then(text => setContent(text));

        setPostId(id);
    }, [searchParams]);

    let edit = () => {
        let url = postId ? `/blog/${postId}` : "/home/laurent";
        let to_url = postId ? "/blog" : "/";
        fetch(url, {
	    method: "PUT",
	    headers: {
	        "Content-Type": "text/plain"
	    },
	    body: content
        })
            .then(response => window.location.replace(to_url));
    };

    let handleChange = (event) => {
        setContent(event.target.value);
    };
    
    return (
        <main>
          <article style={{
              display: "flex",
              flexDirection: "column",
              color: "white",
              margin: "5% 20%"
          }}>
            <h3>Edit Home Text</h3>
            <textarea id="homeEdit" style={{
                width: "100%", height: "400px"
            }}
                      value={content} onChange={handleChange}>
            </textarea>
            <button onClick={edit}>edit</button>
          </article>
        </main>
    );
}

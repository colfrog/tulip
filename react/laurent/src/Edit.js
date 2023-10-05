import { useState, useEffect } from 'react';

export function Edit() {
    let [content, setContent] = useState('');

    useEffect(() => {
        fetch("/home/laurent?content_type=markdown")
            .then(response => response.text())
            .then(text => setContent(text));
    }, []);

    let editHome = () => {
        fetch("/home/laurent", {
	    method: "PUT",
	    headers: {
	        "Content-Type": "text/plain"
	    },
	    body: content
        }).then(response => window.location.replace("/"));
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
            <button onClick={editHome}>edit</button>
          </article>
        </main>
    );
}

import { useState, useEffect } from 'react';

export function Edit() {
    let [content, setContent] = useState("");
    let contentChanged = (event) => {
        setContent(event.target.value);
    };
    let editHome = (event) => {
        fetch("/home/raven", {
	    method: "PUT",
	    headers: {
	        "Content-Type": "text/plain"
	    },
	    body: content
        }).then(response => window.location.replace("/"));
    };

    useEffect(() => {
        fetch("/home/raven?content_type=markdown")
            .then(response => response.text())
            .then(text => setContent(text));
    }, []);
    
    return (
        <main>
          <article id="edit" style={{
              display: "flex",
              flexDirection: "column",
              color: "white",
              margin: "144px 35%"
          }}>
            <h3>Edit Home Text</h3>
            <textarea style={{width: "100%", height: "400px"}}
                      value={content} onChange={contentChanged}></textarea>
            <button onClick={editHome}>edit</button>
          </article>
        </main>
    );
}

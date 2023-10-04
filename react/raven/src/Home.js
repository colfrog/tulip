import { useState, useEffect } from 'react';

export function Home() {
    let [content, setContent] = useState("");
    useEffect(() => {
        fetch("/home/raven?content_type=html")
            .then(response => response.text())
            .then(html => setContent(html));
    }, []);
    return (
        <main>
          <div id="home" style={{margin: "40px 27%"}}
               dangerouslySetInnerHTML={{ __html: content }}>
          </div>
        </main>
    );
}

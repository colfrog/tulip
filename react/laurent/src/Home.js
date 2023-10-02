import { useState } from 'react';

import './home.css';

export function Home() {
    let [content, setContent] = useState('');
    fetch("/home/laurent?content_type=html")
        .then(response => response.text())
        .then(html => setContent(html));

    return (
        <main>
          <div id="home-content" dangerouslySetInnerHTML={{ __html: content }}>
          </div>
        </main>
    );
}

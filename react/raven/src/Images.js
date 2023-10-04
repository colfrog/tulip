import { useState, useEffect } from 'react';

import './images.css';

export function Images() {
    let [imageList, setImageList] = useState([]);
    return (
        <main>
          <div id="image-list">
          </div>
        </main>
    );
}

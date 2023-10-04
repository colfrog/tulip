import { useState, useEffect } from 'react';

import './images.css';

export function Images() {
    let [imageList, setImageList] = useState([]);

    useEffect(() => {
        fetch("/i/all/laurent")
            .then(response => response.json())
            .then(json => {
	        let list = [];
	        json.forEach((imageId, index) => {
	            list.push(
                        <div id={imageId} className="image">
                          <img src={`/i/laurent/${imageId}`} alt={imageId} key={index}></img>
                          <h5>{imageId}</h5>
                        </div>
                    );
	        });

                setImageList(list);
            });
    }, []);
    
    return (
        <main>
          <div id="image-list">
            {imageList}
          </div>
        </main>
    );
}

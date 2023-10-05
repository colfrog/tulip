import { useState, useEffect } from 'react';

import { Image } from './Image';
import { postURL } from './postURL';
import './images.css';

function ImageEntry({imageId}) {
    return (
        <div class="image-view">
          <div id={postURL(imageId)} class="image">
            <Image src={`/i/raven/${imageId}`} alt={imageId} />
            <h5>{imageId}</h5>
          </div>

          <div class="image-forms">
            <form id={`portfolio-form-${postURL(imageId)}`} method="post" action="/portfolio/new">
              <input type="text" id={`portfolio-image-id-${postURL(imageId)}`} name="image-id" value={imageId} hidden></input>
              <label for={`category-input-${postURL(imageId)}`}>Category: </label>
              <input type="text" id={`category-input-${postURL(imageId)}`} name="category" required></input>
              <input type="submit" value="Add to portfolio"></input>
            </form>

            <form id={`character-form-${postURL(imageId)}`} method="post" action="/characters/images/new">
              <input type="text" id={`character-image-id-${postURL(imageId)}`} name="image-id" value={imageId} hidden></input>
              <label for={`character-input-${postURL(imageId)}`}>Character name: </label>
              <input type="text" id={`character-input-${postURL(imageId)}`} name="name" required></input>
              <input type="submit" value="Add to character"></input>
            </form>
          </div>
        </div>
    );
}

export function Images() {
    let [imageList, setImageList] = useState([]);

    useEffect(() => {
        fetch("/i/all/raven")
            .then(response => response.json())
            .then(json => {
	        let list = [];
	        json.forEach((imageId, index) => {
                    list.push(<ImageEntry imageId={imageId} key={index} />);
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

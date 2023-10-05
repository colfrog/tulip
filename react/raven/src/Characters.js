import { useState, useEffect } from 'react';

function CharacterImageList({character}) {
    let [images, setImages] = useState({});
    let [imageList, setImageList] = useState([]);
    let buildImageList = () => {
        console.log(`buildImageList called for ${character}`);
        console.log(images);
        let list = [];
	images[character].forEach((image, index) => {
	    list.push(<img style={{
                width: "240px",
                height: "auto",
                margin: "24px"
            }} src={`/i/raven/${image}`} alt={image} key={index}></img>);
	});
        setImageList(list);
    };

    useEffect(() => {
        if (!character) {
            setImageList([]);
            return;
        }

        if (Object.keys(images).includes(character)) {
            buildImageList();
            return;
        }

        
	fetch(`/characters/images/${character}`)
	    .then(response => response.json())
	    .then(json => {
                let currentImages = images;
                currentImages[character] = json.reverse();
                setImages(currentImages);
                buildImageList(json);
	    });
    }, [character, images]);

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap"
        }} id="character-image-list">
          {imageList}
        </div>
    );
}

function Character({name, image, description, onClick}) {
    return (
        <div id={name} style={{
            display: "flex",
            flexDirection: "column",
            width: "500px",
            height: "600px",
            margin: "35px"
        }}>
          <h3 style={{margin: "0"}}>{name}</h3>
          <img style={{
              margin: "0",
              width: "100%",
              height: "auto",
              objectFit: "contain"
          }} src={`/i/raven/${image}`} alt={`${name}: ${description}`}
               onClick={onClick}></img>
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
        </div>
    );
}

export function Characters() {
    let [characters, setCharacters] = useState([]);
    let [characterList, setCharacterList] = useState([]);
    let [characterShown, setCharacterShown] = useState(null);
    let buildCharacterList = () => {
        let list = [];
	characters.forEach(character => {
            let showCharacterList = () => {
                console.log(`${character.name} clicked`);
                if (characterShown === character.name)
                    setCharacterShown(null);
                else
                    setCharacterShown(character.name);
            };
            list.push(<Character name={character.name} image={character.image}
                                 description={character.description}
                                 onClick={showCharacterList} />);
        });
        setCharacterList(list);
    };

    useEffect(() => {
        fetch("/characters/all")
	    .then(response => response.json())
	    .then(json => {
                setCharacters(json);
                buildCharacterList();
            });
    }, []);

    useEffect(() => {
        buildCharacterList(characters);
    }, [characterShown, characters]);

    return (
        <main>
          <div id="character-list" style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around"
          }}>
            {characterList}
          </div>
          <CharacterImageList character={characterShown} />
        </main>
    );
}

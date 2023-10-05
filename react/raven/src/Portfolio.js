import { useState, useEffect } from 'react';

function makeCategoryID(category) {
    return category.replace(/ /g, "-");
}

function CategoryList({categories}) {
    let [categoryList, setCategoryList] = useState([]);
    useEffect(() => {
        let list = [];
        categories.forEach((category, index) => {
            let categoryID = makeCategoryID(category);
            let scrollToCategory = () => window.location.href = `#${categoryID}`;
            list.push(<p style={{margin: "12px"}}
                         onClick={scrollToCategory} key={index}>{category}</p>);
        });
        setCategoryList(list);
    }, [categories]);

    return (
        <aside style={{
            backgroundColor: "black",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap"
        }}>
          {categoryList}
        </aside>
    );
}

function Category({name, images}) {
    let [showImageList, setShowImageList] = useState(true);
    let [imageList, setImageList] = useState([]);
    let categoryID = makeCategoryID(name);
    let toggleImages = () => setShowImageList(!showImageList);

    useEffect(() => {
        let list = [];
        let imageStyle = {
            maxHeight: "240px",
            maxWidth: "240px",
            margin: "24px"
        };
        images.forEach((image, index) => {
            list.push(<img style={imageStyle} src={`/i/raven/${image}`} alt={image}></img>);
        });
        setImageList(list);
    }, []);

    let imagesToShow = null;
    if (showImageList)
        imagesToShow = imageList;
    
    return (
        <div id={`${categoryID}`}>
          <h3 onClick={toggleImages}>{name}</h3>
          {imagesToShow}
        </div>
    );
}

export function Portfolio() {
    let [images, setImages] = useState({});
    let [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("/portfolio/all")
	    .then(response => response.json())
	    .then(json => {
                let imageTable = {};
	        json.forEach(entry => {
		    let category = entry.category;
                    let image = entry.image_id;
		    if (!imageTable[category])
		        imageTable[category] = [image];
                    else
                        imageTable[category].push(image);
	        });

                setImages(imageTable);

                let list = [];
                Object.keys(imageTable).forEach((category, index) => {
                    list.push(<Category name={category} images={imageTable[category]} />);
                });
                setCategories(list);
	    });
    }, []);
    
    return (
        <main style={{display: "flex", flexDirection: "column"}}>
          <CategoryList categories={Object.keys(images)} />
          <div id="portfolio" style={{
              backgroundImage: "linear-gradient(#d38292, #eaf0e0)",
              color: "#293c4a"
          }}>
            {categories}
          </div>
        </main>
    );
}

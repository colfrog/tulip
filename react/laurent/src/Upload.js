import { useState } from 'react';

export function Upload() {
    let [id, setId] = useState('');
    let [file, setFile] = useState(null);
    let uploadFile = () => {
        if (id && file) {
            fetch(`/i/laurent/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "image/png"
                },
                body: file
            })
                .then(response => {
                    if (response.ok)
                        alert(`Uploaded file`);
                    else
                        alert("File upload failed");
                });
        }
    };

    return (
        <main>
          <div style={{ margin: "100px 35%" }}>
            <h3>Upload Images</h3>
            <label>Image ID: </label>
            <input id="imageID" type="text" value={id}
                   onChange={(e) => setId(e.target.value)} /><br />
            <label>File: </label>
            <input id="imageFile" type="file" accept="image/png,image/jpeg"
                   onChange={(e) => setFile(e.target.files[0])} /><br />
            <button onClick={uploadFile}>upload</button>
          </div>
        </main>
    );
}

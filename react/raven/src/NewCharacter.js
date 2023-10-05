export function NewCharacter() {
    return (
        <main>
          <form style={{margin: "100px 30%"}}
                id="new-character-form" method="post" action="/characters/new">
            <label for="name-input">Name: </label>
            <input type="text" id="name-input" name="name" required></input><br />
            <label for="image-input">Image ID: </label>
            <input type="text" id="image-input" name="image" required></input><br />
            <label for="description-input">Description: </label>
            <textarea style={{
                width: "100%",
                height: "500px",
                margin: "20px"
            }}
                      id="description-input" name="description" required></textarea>
            <input type="submit"></input>
          </form>
        </main>
    );
}

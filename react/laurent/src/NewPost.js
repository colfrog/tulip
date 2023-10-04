import './newpost.css';

export function NewPost() {
    return (
        <main>
          <form id="new-post-form" method="post" action="/blog/new">
            <label>Title: </label>
            <input type="text" id="title-input" name="title" required />
            <textarea id="text-input" name="text" required></textarea>
            <input type="submit" />
          </form>
        </main>
    );
}

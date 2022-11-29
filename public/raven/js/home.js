function updateHome() {
    let text = document.querySelector('#editArea').value;
    console.log(text);
    fetch('/api/home', {
	method: 'PUT',
	headers: {
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify({
	    content: text
	})
    });
}

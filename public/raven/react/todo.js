class ToDo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      text: props.text,
      done: props.done
    };
    this.deleteFunction = props.deleteFunction;
  }
  deleteTodo() {
    fetch('/api/todo', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.id
      })
    });
    this.deleteFunction(this);
  }
  setDone() {
    fetch('/api/todo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.id,
        done: true
      })
    }).then(response => {
      return response.json();
    }).then(json => {
      this.setState({
        done: json.done
      });
    });
  }
  render() {
    let text = this.state.text;
    if (this.state.done) text = /*#__PURE__*/React.createElement("del", null, text);
    let doneButton = /*#__PURE__*/React.createElement("button", {
      onClick: this.setDone.bind(this)
    }, "done");
    if (this.state.done) doneButton = "";
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("li", null, text, doneButton, /*#__PURE__*/React.createElement("button", {
      onClick: this.deleteTodo.bind(this)
    }, "delete")));
  }
}
class ToDoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      text: ''
    };
    fetch('/api/todo').then(response => {
      if (!response.ok) throw new Error(`Failed to fetch todo: ${response.status}`);
      return response.json();
    }).then(json => {
      let list = [];
      json.forEach(item => {
        let todo = /*#__PURE__*/React.createElement(ToDo, {
          key: item._id,
          id: item._id,
          text: item.text,
          done: item.done,
          deleteFunction: this.deleteItem.bind(this)
        });
        list.push(todo);
      });
      this.setState({
        todoList: list
      });
    });
  }
  textChanged(event) {
    this.setState({
      text: event.target.value
    });
  }
  addItem() {
    let text = this.state.text;
    fetch('/api/todo', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: this.state.text,
        done: false
      })
    }).then(response => {
      if (!response.ok) throw new Error(`Failed to post todo: ${response.status}`);
      return response.json();
    }).then(json => {
      console.log(json);
      let todo = this.state.todoList.concat( /*#__PURE__*/React.createElement(ToDo, {
        key: json._id,
        id: json._id,
        text: text,
        deleteFunction: this.deleteItem.bind(this)
      }));
      this.setState({
        todoList: todo
      });
    });
    this.setState({
      text: ''
    });
  }
  deleteItem(toDelete) {
    console.log(toDelete);
    let todoList = this.state.todoList.filter(item => item.props.id !== toDelete.props.id);
    this.setState({
      todoList: todoList
    });
  }
  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "To Do:"), /*#__PURE__*/React.createElement("ul", null, this.state.todoList, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: this.state.text,
      onChange: this.textChanged.bind(this)
    }), /*#__PURE__*/React.createElement("button", {
      onClick: this.addItem.bind(this)
    }, "add"))));
  }
}
const domContainer = document.querySelector('#todo');
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(ToDoList, null));
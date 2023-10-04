import './login.css';

export function Login() {
    return (
        <main>
          <form id="login-form" method="post" action="/login">
            <label>Username: </label>
            <input id="username-input" name="username" type="text" /><br />
            <label>Password: </label>
            <input id="password-input" name="password" type="password" />
            <input type="submit" />
          </form>
        </main>
    );
}

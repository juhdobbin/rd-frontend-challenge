(() => {
    const selector = selector => document.querySelector(selector);
    const create = element => document.createElement(element);

    const app = selector('#app');

    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const loading = create('span');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();     
        loading.classList.add('show');
        Login.style.display = 'none';

        const [email, password] = [selector('#email'), selector('#password')];

        const {
            url
        } = await fakeAuthenticate(email.value, password.value);

        location.href = '#users';

        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        !email.validity.valid || !email.value || password.value.length <= 5 ?
            button.setAttribute('disabled', 'disabled') :
            button.removeAttribute('disabled');
    };

    Form.innerHTML = buildForm();

    app.appendChild(Logo);
    createLoading();
    Login.appendChild(Form);

    function buildForm() {
        const inputEmail =
            "<input type='email' id='email' required name='email' placeholder='Entre com seu e-mail'/> ";
        const inputPassword =
            "<input type='password' id='password' minlength='5' required name='password' placeholder='Digite sua senha supersecreta'/> ";
        const inputButton = "<button type='submit' disabled='disabled'> Entrar </button>";

        return inputEmail + inputPassword + inputButton;
    }

    async function fakeAuthenticate(email, password) {
        const url = 'http://www.mocky.io/v2/5dba690e3000008c00028eb6';

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${new Date().getTime() + 300000}`;
        localStorage.setItem('token', fakeJwtToken);

        return data;
    }

    async function getDevelopersList(url) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            referrerPolicy: 'no-referrer'
        });

        return await response.json();
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        loading.classList.remove('show');

        const ul = create('ul');
        ul.classList.add('users-list');

        users.forEach(user => {
            const li = create('li');
            li.classList.add('user');

            const username = document.createTextNode(user.login);
            const avatar = create('img');
            avatar.src = user.avatar_url;

            li.appendChild(avatar);
            li.appendChild(username);

            ul.appendChild(li);
        });

        app.appendChild(ul);
    }

    function createLoading() {
        loading.classList.add('loader');
        app.append(loading);
    }

    // init
    (async function () {
        const rawToken = localStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null;
        if (!token || token[2] < new Date().getTime()) {
            localStorage.removeItem('token');
            location.href = '#login';
            app.appendChild(Login);
        } else {
            location.href = '#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })();
})();
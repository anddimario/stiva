import config from 'config';
import { authHeader, handleResponse } from '../_helpers';

export const userService = {
    login,
    logout,
    register,
    getMe,
    getAll,
    getByEmail,
    add,
    update,
    updatePassword,
    delete: _delete
};

function login(email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...config.siteHeader },
        body: JSON.stringify({ email, password, type: 'login' })
    };

    return fetch(`${config.apiUrl}/users`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function register(user) {
    const body = user;
    body.type = 'registration';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function getMe() {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/users?type=me`, requestOptions).then(handleResponse);
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/users?type=list`, requestOptions).then(handleResponse);
}

function getByEmail(email) {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/users?type=get&email=${email}`, requestOptions).then(handleResponse);
}

function update(user) {
    const body = user;
    body.type = 'update';
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json', ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function updatePassword(password) {
    const body = password;
    body.type = 'update-password';
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json', ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function add(user) {
    const body = user;
    body.type = 'add';
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(email) {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/users?type=delete&email=${email}`, requestOptions).then(handleResponse);
}

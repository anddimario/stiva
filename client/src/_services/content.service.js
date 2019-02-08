import config from 'config';
import { authHeader, handleResponse } from '../_helpers';

export const contentService = {
  add,
  list,
  delete: _delete
};

function add(content) {
    const body = content;
    body.type = 'add';
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/contents`, requestOptions).then(handleResponse);
}

function list(contentType) {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/contents?type=list&contentType=${contentType}`, requestOptions).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(values) {
    const requestOptions = {
        method: 'GET',
        headers: { ...authHeader(), ...config.siteHeader }
    };

    return fetch(`${config.apiUrl}/contents?type=delete&id=${values.id}&contentType=${values.contentType}`, requestOptions).then(handleResponse);
}


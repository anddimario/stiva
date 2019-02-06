import config from 'config';
import { authHeader, handleResponse } from '../_helpers';

export const contentService = {
  add
};

function add(content) {
    const body = content;
    console.log(body);
    body.type = 'add';
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), ...config.siteHeader },
        body: JSON.stringify(body)
    };

    return fetch(`${config.apiUrl}/contents`, requestOptions).then(handleResponse);
}


import axios from 'axios';
import config from 'config';
import { authHeader, handleResponse } from '../_helpers';

// https://miguelmota.com/bytes/base64-mime-regex/
function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== 'string') {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

export const uploadService = {
  sendFile,
  list,
  delete: _delete
};

function sendFile(file, key) {
  const endpoint = `${config.apiUrl}/uploads`;
  //
  const contentType = base64MimeType(file);

  const payload = {
    key,
    file,
    contentType
  };
  const headers = { ...authHeader(), ...config.siteHeader };
  return axios.post(endpoint, payload, { headers })
    .then((res) => {
      return Promise.resolve(res);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function list() {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), ...config.siteHeader }
  };

  return fetch(`${config.apiUrl}/uploads?type=list`, requestOptions).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(key) {
  const requestOptions = {
    method: 'GET',
    headers: { ...authHeader(), ...config.siteHeader }
  };
console.log(key)
  return fetch(`${config.apiUrl}/uploads?type=delete&key=${key}`, requestOptions).then(handleResponse);
}


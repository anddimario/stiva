import axios from 'axios'
import config from 'config';
import { authHeader } from '../_helpers';

export default {
  getSignedURL (file) {
    let endpoint = `${config.apiUrl}/uploads`;
    let payload = {
      filePath: file.name,
      contentType: file.type
    };
    const headers = { ...authHeader(), ...config.siteHeader };
    return axios.post(endpoint, payload, { headers })
      .then((res) => {
        return Promise.resolve(res.data.url || '/')
      })
      .catch((err) => {
        console.error(err)
        return Promise.reject('/')
      })
  }
}

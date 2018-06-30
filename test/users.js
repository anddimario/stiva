'use strict';

const users = require('../users');
const login = require('../login');

const admin = {
  email: 'admin@example.com',
  password: 'password'
};
const user = {
  email: 'test@example.com',
  password: 'password',
};

describe('Users', () => {
  this.adminToken;
  this.userToken;

  before(async () => {
    try {
      const response = await login.run({
        body: JSON.stringify(admin)
      });
      this.adminToken = JSON.parse(response.body).token;
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should create user', async () => {
    try {
      const tmp = {
        email: user.email,
        password: user.password,
        userRole: 'user',
        type: 'add'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should get users', async () => {
    try {
      const response = await users.get({
        queryStringParameters: {
          type: 'list'
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should get user by admin', async () => {
    try {
      const response = await users.get({
        queryStringParameters: {
          type: 'get',
          email: user.email
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should login as user', async () => {
    try {
      const response = await login.run({
        body: JSON.stringify(user)
      });
      this.userToken = JSON.parse(response.body).token;
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should get me', async () => {
    try {
      const response = await users.get({
        queryStringParameters: {
          type: 'me'
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should delete user', async () => {
    try {
      const response = await users.get({
        queryStringParameters: {
          type: 'delete',
          email: user.email
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });
});
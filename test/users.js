'use strict';

const users = require('../users');
const config = require('../config');

const admin = {
  email: 'admin@example.com',
  password: 'password'
};
const user = {
  email: 'test@example.com',
  password: 'atmppassword',
};

describe('Users', () => {
  this.adminToken;
  this.userToken;

  before(async () => {
    try {
      const loginInfo = admin;
      loginInfo.type = 'login';
      const response = await users.post({
        body: JSON.stringify(loginInfo)
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

  if (config.registration) {
    it('should register user', async () => {
      try {
        const tmp = {
          email: 'reguser@example.com',
          password: user.password,
          type: 'registration',
          fullname: 'my test'
        };
        const response = await users.post({
          body: JSON.stringify(tmp),
        });
        if (response.statusCode === 500) {
          throw response.body;
        }
        return;
      } catch (err) {
        throw err;
      }
    });
  }

  it('should create user - admin', async () => {
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

  it('should update user as admin', async () => {
    try {
      const tmp = {
        email: user.email,
        fullname: 'Test',
        type: 'update'
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
      const loginInfo = user;
      loginInfo.type = 'login';
      const response = await users.post({
        body: JSON.stringify(loginInfo)
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

  it('should update me', async () => {
    try {
      const tmp = {
        fullname: 'Test',
        type: 'update'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
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

  it('should update password as admin', async () => {
    try {
      const tmp = {
        email: user.email,
        password: 'password',
        type: 'update-password'
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

  it('should update password as me', async () => {
    try {
      const tmp = {
        password: 'password',
        type: 'update-password'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
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

  it('should not login as user with old password', async () => {
    try {
      const loginInfo = user;
      loginInfo.type = 'login';
      const response = await users.post({
        body: JSON.stringify(loginInfo)
      });
      this.userToken = JSON.parse(response.body).token;
      if (response.statusCode !== 500) {
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

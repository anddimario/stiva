'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_OPTIONS));

const users = require('../users');
const sites = require('../sites');

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
        body: JSON.stringify(loginInfo),
        headers: {
          'x-slsmu-site': 'localhost'
        }
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

  if (sites[process.env.SITE].registration) {
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
          headers: {
            'x-slsmu-site': 'localhost'
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
  }

  it('should create user as admin', async () => {
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
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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
        type: 'update',
        userRole: 'user'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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
        body: JSON.stringify(loginInfo),
        headers: {
          'x-slsmu-site': 'localhost'
        }
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
          'Authorization': `Bearer ${this.userToken}`,
          'x-slsmu-site': 'localhost'
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
          'Authorization': `Bearer ${this.userToken}`,
          'x-slsmu-site': 'localhost'
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
        new: 'password',
        type: 'update-password'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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
        new: 'password',
        type: 'update-password'
      };
      const response = await users.post({
        body: JSON.stringify(tmp),
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'x-slsmu-site': 'localhost'
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
        body: JSON.stringify(loginInfo),
        headers: {
          'x-slsmu-site': 'localhost'
        }
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
          'Authorization': `Bearer ${this.adminToken}`,
          'x-slsmu-site': 'localhost'
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

  after(async () => {
    try {
      const TableName = `${process.env.DB_PREFIX}users`;
      // Clean all
      await dynamodb.delete({
        TableName,
        Key: {
          email: 'reguser@example.com'
        }
      }).promise();
      return;
    } catch (err) {
      throw err;
    }
  });
});

'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_OPTIONS));

const users = require('../users');
const contents = require('../contents');

const admin = {
  email: 'admin@example.com',
  password: 'password'
};
const user = {
  email: 'test@example.com',
  password: 'password',
};

describe('Contents', () => {
  this.adminToken;
  this.userToken;
  this.anotherUserToken;
  this.contentId;

  before(async () => {
    try {
      const loginInfo = admin;
      loginInfo.type = 'login';
      const response = await users.post({
        body: JSON.stringify(admin),
        headers: {
          'X-SLSMU-SITE': 'localhost'
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

  before(async () => {
    try {
      // Create user first
      const tmp = {
        email: user.email,
        password: user.password,
        userRole: 'user',
        type: 'add'
      };
      await users.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      const loginInfo = user;
      loginInfo.type = 'login';

      const response = await users.post({
        body: JSON.stringify(user),
        headers: {
          'X-SLSMU-SITE': 'localhost'
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


  before(async () => {
    try {
      // Create another user first
      const tmp = {
        email: 'test1@example.com',
        password: 'password',
        userRole: 'user',
        type: 'add'
      };
      await users.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      const response = await users.post({
        body: JSON.stringify({
          email: 'test1@example.com',
          password: 'password',
          type: 'login'
        }),
        headers: {
          'X-SLSMU-SITE': 'localhost'
        }
      });
      this.anotherUserToken = JSON.parse(response.body).token;
      if (response.statusCode === 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should create content', async () => {
    try {
      const tmp = {
        contentText: "This is only a test",
        title: "Test post",
        contentType: "post",
        type: 'add'
      };
      const response = await contents.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
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

  it('should create private content', async () => {
    try {
      const tmp = {
        contentText: "This is a private a test",
        title: "Private",
        contentType: "post",
        type: 'add',
        private: true
      };
      const response = await contents.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
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

  it('should not create content (validation error)', async () => {
    try {
      const tmp = {
        contentText: "This is only a test",
        title: 101,
        contentType: "post",
        type: 'add'
      };
      const response = await contents.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode !== 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should not list contents as user (not allowed as viewers)', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'list',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode !== 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should list contents as admin', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'list',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      this.contentId = JSON.parse(response.body).Items[0].id;
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should list contents as guest', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'list',
          contentType: 'post'
        },
        headers: {
          'X-SLSMU-SITE': 'localhost'
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

  it('should list private content only', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'list',
          contentType: 'post',
          private: true
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      for (const content of JSON.parse(response.body).Items) {
        if (content.title === 'Private') {
          throw 'Private content is showed by not allowed user'
        }
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should get content as admin', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          id: this.contentId,
          type: 'get',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
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

  it('should get private content as allowed user', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          id: this.contentId,
          type: 'get',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
          'X-SLSMU-SITE': 'localhost'
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

  it('should not get content as user (not allowed as viewers)', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          id: this.contentId,
          type: 'get',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode !== 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should get content as guest', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          id: this.contentId,
          type: 'get',
          contentType: 'post'
        },
        headers: {
          'X-SLSMU-SITE': 'localhost'
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

  it('should update content', async () => {
    try {
      const tmp = {
        id: this.contentId,
        contentText: "This is only a test",
        title: "Test post",
        contentType: "post",
        type: 'update'
      };
      const response = await contents.post({
        body: JSON.stringify(tmp),
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
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

  it('should not delete as guest', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'delete',
          id: this.contentId,
          contentType: 'post'
        },
        headers: {
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode !== 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should not delete as not owner or admin', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'delete',
          id: this.contentId,
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.anotherUserToken}`,
          'X-SLSMU-SITE': 'localhost'
        }
      });
      if (response.statusCode !== 500) {
        throw response.body;
      }
      return;
    } catch (err) {
      throw err;
    }
  });

  it('should delete as owner', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'delete',
          id: this.contentId,
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-SLSMU-SITE': 'localhost'
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
      const TableNameUser = `${process.env.DB_PREFIX}users`;
      // Clean all
      await dynamodb.delete({
        TableName: TableNameUser,
        Key: {
          email: user.email
        }
      }).promise();
      await dynamodb.delete({
        TableName: TableNameUser,
        Key: {
          email: 'test1@example.com'
        }
      }).promise();
      return;
    } catch (err) {
      throw err;
    }
  });
});

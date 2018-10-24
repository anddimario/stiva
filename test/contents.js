'use strict';

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
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      const loginInfo = user;
      loginInfo.type = 'login';

      const response = await users.post({
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
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      const response = await users.post({
        body: JSON.stringify({
          email: 'test1@example.com',
          password: 'password',
          type: 'login'
        })
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
          Authorization: `Bearer ${this.userToken}`
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
          Authorization: `Bearer ${this.userToken}`
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
          Authorization: `Bearer ${this.adminToken}`
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      this.contentId = JSON.parse(response.body)[0].id;
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
        }
      });
      if (response.statusCode === 500) {
        throw response.body;
      }
      this.contentId = JSON.parse(response.body)[0].id;
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

  it('should not get content as user (not allowed as viewers)', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          id: this.contentId,
          type: 'get',
          contentType: 'post'
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`
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

  it('should not delete as guest', async () => {
    try {
      const response = await contents.get({
        queryStringParameters: {
          type: 'delete',
          id: this.contentId,
          contentType: 'post'
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
          Authorization: `Bearer ${this.anotherUserToken}`
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
});

module.exports = {
  localhost: {
    bucketName: 'testLocalhost',
    dbPrefix: 'localhost_',
    tokenSecret: 'testlocalhost',
    users: {
      fields: ['fullname']
    },
    contents: {
      post: {
        table: 'contents',
        creators: ['user', 'admin'], // allowed creators
        fields: ['contentText', 'title'], // field to get in body
        viewers: ['guest', 'admin'] // allowed viewers
      }
    },
    registration: true,
    validators: {
      'login': {
        properties: {
          email: { format: 'email' }
        }
      },
      'registration': {
        properties: {
          email: { format: 'email' },
          password: { type: 'string' }
        }
      },
      'content-add': {
        properties: {
          contentText: { type: 'string' },
          title: { type: 'string' }
        }
      },
      'content-update': {
        properties: {
          contentText: { type: 'string' },
          title: { type: 'string' }
        }
      }
    }
  }
};

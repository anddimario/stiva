module.exports = {
  AWS_REGION: 'localhost',
  DYNAMO: { endpoint: 'http://localhost:8000' },
  S3: {endpoint: 'http://localhost:4572'},
  siteHeader: 'X-SLSMU-SITE',
  sites: {
    localhost: {
      bucketName: 'testLocalhost',
      dbPrefix: 'localhost_',
      TOKEN_SECRET: 'testlocalhost',
      users: {
        fields: ['fullname']
      },
      CONTENTS: {
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
  }
};

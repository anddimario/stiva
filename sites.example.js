module.exports = {
  localhost: {
    fromAddress: 'noreply@example.com',
    frontendUrl: 'http://localhost/',
    bucketName: 'testLocalhost',
    dbPrefix: 'localhost_',
    tokenSecret: 'testlocalhost',
    users: {
      fields: ['fullname']
    },
    uploadsPermissions: {
      creators: ['user', 'admin'], // allowed creators
      viewers: ['user', 'admin'], // allowed viewers
    },
    contents: {
      post: {
        table: 'contents',
        creators: ['user', 'admin'], // allowed creators
        fields: ['contentText', 'title'], // field to get in body
        viewers: ['guest', 'admin'], // allowed viewers
        allowFilters: ['<', '>', '='], // allowed filters in contents list
        projection: ', title, contentText' // projection fields for contents list
      }
    },
    transaction: true,
    availableTransaction: {
      // 'table': {condition: '..', update: ''}
      'contents': { condition: 'title = :title', update: 'SET contentText = :contentText' }
    },
    registration: true,
    passwordRecovery: true,
    emailTemplates: {
      passwordRecovery: 'examplePasswordRecovery'
    },
    emailSubjects: {
      passwordRecovery: 'Recovery your password'
    },
    validators: {
      'login': {
        properties: {
          email: { format: 'email' }
        },
        required: ['email']
      },
      'recoveryToken': {
        properties: {
          email: { format: 'email' }
        },
        required: ['email']
      },
      'passwordRecovery': {
        properties: {
          token: { type: 'string' },
          password: { type: 'string' }
        },
        required: ['token', 'password']
      },
      'registration': {
        properties: {
          email: { format: 'email' },
          password: { type: 'string' }
        },
        required: ['email']
      },
      'content-add': {
        post: {
          properties: {
            contentText: { type: 'string' },
            title: { type: 'string' }
          }
        }
      },
      'content-update': {
        post: {
          properties: {
            contentText: { type: 'string' },
            title: { type: 'string' }
          }
        }
      }
    }
  }
};

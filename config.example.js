module.exports = {
  AWS_REGION: 'localhost',
  TOKEN_SECRET: 'testlocalhost',
  DYNAMO: {"endpoint": "http://localhost:8000"},
  CONTENTS: {
    post: {
      table: 'contents',
      creators: ['user', 'admin'], // allowed creators
      fields: ['contentText', 'title'], // field to get in body
      viewers: ['guest', 'admin'] // allowed viewers
    }
  },
  validators: {
    'login': {
      "properties": {
        "email": { "format": "email" }
      }
    },
    'content-add': {
      "properties": {
        "contentText": { "type": "string" },
        "title": { "type": "string" }
      }
    },
    'content-update': {
      "properties": {
        "contentText": { "type": "string" },
        "title": { "type": "string" }
      }
    }
  }
};

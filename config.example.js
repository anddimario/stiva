module.exports = {
  AWS_REGION: 'localhost',
  TOKEN_SECRET: 'testlocalhost',
  DYNAMO: {"endpoint": "http://localhost:8000"},
  CONTENTS: {
    post: {
      table: 'contents',
      creators: ['admin'], // allowed creators
      fields: ['text', 'title'] // field to get in body
    }
  }
};

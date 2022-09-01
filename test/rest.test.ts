// https://aws.amazon.com/it/blogs/mobile/introducing-template-evaluation-and-unit-testing-for-aws-appsync-resolvers/
// https://docs.aws.amazon.com/appsync/latest/devguide/test-debug-resolvers.html
const AWS = require('aws-sdk');
const awsRegion = process.env.AWS_REGION ? process.env.AWS_REGION : 'us-east-1';

const client = new AWS.AppSync({ region: awsRegion });
const fs = require('fs');

// https://stackoverflow.com/questions/58264344/conditionally-run-tests-in-jest
const maybe = process.env.TEST_REST ? describe : describe.skip;

const templateAddContent = fs.readFileSync(
  './lib/vtl/addContentRequest.vtl',
  'utf8'
);
const templateGetContent = fs.readFileSync(
  './lib/vtl/getContentRequest.vtl',
  'utf8'
);
const contextAddContent = JSON.parse(
  fs.readFileSync('./test/context/addContentRequest.json', 'utf8')
);

maybe('Test rest - Evaluate the Resolvers', () => {
  jest.setTimeout(30000);

  let contentId;

  test('Add content', async () => {
    const response = await client
      .evaluateMappingTemplate({ templateAddContent, contextAddContent })
      .promise();
    const result = JSON.parse(response.evaluationResult);
    contentId = result.attributeValues.id.S;
    expect(result.attributeValues.contentValue.S).toEqual(
      contextAddContent.arguments.input.contentValue
    );
  });

  // test('Get content', async () => {
  //   const response = await client
  //     .evaluateMappingTemplate({ templateGetContent, context })
  //     .promise();
  //   const result = JSON.parse(response.evaluationResult);
  //   expect(result.attributeValues.contentValue.S).toEqual(
  //     contextAddContent.arguments.input.contentValue
  //   );
  // });
});

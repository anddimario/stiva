import * as request from "supertest";
import * as AWS from "aws-sdk";

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const configAws = require("../cdk-outputs.json");

// https://stackoverflow.com/questions/58264344/conditionally-run-tests-in-jest
const maybe = process.env.TEST_REST ? describe : describe.skip;

maybe("Rest Api test", () => {
  jest.setTimeout(30000);

  let token: string | undefined;
  let roleId: string;
  const password = Math.random().toString(36).substring(2, 15);
  const username = `${Math.random().toString(36).substring(2, 15)}@example.com`;

  beforeAll(async () => {
    try {
      // Create cognito user
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminCreateUser-property
      await cognitoidentityserviceprovider
        .adminCreateUser({
          UserPoolId: configAws["cognito-stack"].userPoolId,
          Username: username,
        })
        .promise();
      await cognitoidentityserviceprovider
      .adminSetUserPassword({
        UserPoolId: configAws["cognito-stack"].userPoolId,
        Username: username,
        Permanent: true,
        Password: password
      }).promise();
      
      const auth = await cognitoidentityserviceprovider
        .adminInitiateAuth({
          AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
          UserPoolId: configAws["cognito-stack"].userPoolId,
          ClientId: configAws["cognito-stack"].userPoolClientId,
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        })
        .promise();
      token = auth.AuthenticationResult?.IdToken;
    } catch (error) {
      console.log(error);
    }
  });

  test(`/settings (POST) - add a role (invalid request)`, async () => {
    return request(configAws["apigateway-stack"].userRolesApiUrl)
      .post("/settings")
      .send({
        name: "test",
        description: "test",
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });

  test(`/settings (POST) - add a role`, async () => {
    return request(configAws["apigateway-stack"].userRolesApiUrl)
      .post("/settings")
      .send({
        name: "test",
        description: "test",
        policies: JSON.stringify({}),
      })
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        roleId = res.body.requestId
        expect(res.body).toHaveProperty('requestId')
        return;
      });
  });

  test(`/settings/:id (DELETE) - delete a role`, async () => {
    return request(configAws["apigateway-stack"].userRolesApiUrl)
      .delete(`/settings/${roleId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  afterAll(async () => {
    try {
      // Delete cognito user
      await cognitoidentityserviceprovider
        .adminDeleteUser({
          UserPoolId: configAws["cognito-stack"].userPoolId,
          Username: username,
        })
        .promise();
    } catch (error) {
      console.log(error);
    }
  });
});

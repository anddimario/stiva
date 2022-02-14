import * as request from "supertest";
import * as AWS from "aws-sdk";

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const configAws = require("../cdk-outputs.json");

// https://stackoverflow.com/questions/58264344/conditionally-run-tests-in-jest
const maybe = process.env.TEST_REST ? describe : describe.skip;

async function createCognitoUserAndGetToken(
  username: string,
  userRole: string
): Promise<string | undefined> {
  const password = '(4nxaG`"bdj<U%G?'; // fake password that respect the policy

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
      Password: password,
    })
    .promise();
  await cognitoidentityserviceprovider
    .adminAddUserToGroup({
      GroupName: userRole,
      UserPoolId: configAws["cognito-stack"].userPoolId,
      Username: username,
    })
    .promise();

  // const auth = await cognitoidentityserviceprovider
  //   .adminInitiateAuth({
  //     AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
  //     UserPoolId: configAws["cognito-stack"].userPoolId,
  //     ClientId: configAws["cognito-stack"].userPoolClientId,
  //     AuthParameters: {
  //       USERNAME: username,
  //       PASSWORD: password,
  //     },
  //   })
  //   .promise();

  // return auth.AuthenticationResult?.IdToken;
  const auth = await cognitoidentityserviceprovider
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: configAws["cognito-stack"].userPoolClientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    })
    .promise();
// console.log(auth);
  return auth.AuthenticationResult?.IdToken;
}

maybe("Rest Api test", () => {
  jest.setTimeout(30000);

  let userToken: string | undefined;
  let adminToken: string | undefined;
  let stivaId: string;
  const userUsername = `${Math.random()
    .toString(36)
    .substring(2, 15)}@example.com`;
  const adminUsername = `${Math.random()
    .toString(36)
    .substring(2, 15)}@example.com`;

  beforeAll(async () => {
    try {
      userToken = await createCognitoUserAndGetToken(userUsername, "user");
      adminToken = await createCognitoUserAndGetToken(adminUsername, "admin");
    } catch (error) {
      console.log(error);
    }
  });

  test(`/stiva (POST) - can't add a stiva as user`, async () => {
    return (
      request(configAws["apigateway-stack"].apiUrl)
        .post("/stiva")
        .send({
          name: "test",
          description: "test",
          value: JSON.stringify({}),
        })
        .set("Authorization", `Bearer ${userToken}`)
        // .expect(200)
        .then((res) => {
          console.log(userToken);
          console.log(res.body);
          stivaId = res.body.requestId;
          expect(res.body).toHaveProperty("requestId");
          return;
        })
    );
  });

  test(`/stiva (POST) - add a stiva (invalid request)`, async () => {
    return request(configAws["apigateway-stack"].apiUrl)
      .post("/stiva")
      .send({
        name: "test",
        description: "test",
      })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);
  });

  test(`/stiva (POST) - add a stiva`, async () => {
    return request(configAws["apigateway-stack"].apiUrl)
      .post("/stiva")
      .send({
        name: "test",
        description: "test",
        value: JSON.stringify({}),
      })
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200)
      .then((res) => {
        stivaId = res.body.requestId;
        expect(res.body).toHaveProperty("requestId");
        return;
      });
  });

  test(`/stiva/:id (DELETE) - delete a stiva`, async () => {
    return request(configAws["apigateway-stack"].apiUrl)
      .delete(`/stiva/${stivaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
  });

  afterAll(async () => {
    try {
      // Delete cognito user
      await cognitoidentityserviceprovider
        .adminDeleteUser({
          UserPoolId: configAws["cognito-stack"].userPoolId,
          Username: userUsername,
        })
        .promise();
      await cognitoidentityserviceprovider
        .adminDeleteUser({
          UserPoolId: configAws["cognito-stack"].userPoolId,
          Username: adminUsername,
        })
        .promise();
    } catch (error) {
      console.log(error);
    }
  });
});

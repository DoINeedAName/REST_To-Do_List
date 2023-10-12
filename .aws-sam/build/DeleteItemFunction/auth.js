const AWS = require("aws-sdk");

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  region: 'ap-southeast-2'
});
const clientId = 'eq77br5ct0pdc1fiufb50lc1c';
const userPoolId = 'ap-southeast-2_eDIQHalKN';

exports.handler = async (event) => {
  console.log("path: " + event.path);

  let authInfo = JSON.parse(event.body);
  console.log(authInfo);

  let responseCode = 500;
  let responseBody = "Path not recognized";
  switch (true) {
    case event.path === "/items/register":
      responseCode = 200;
      responseBody = await register(
                                authInfo.username,
                                authInfo.password,
                                authInfo.email);
      break;
    case event.path === "/items/login":
      responseCode = 200;
      responseBody = await login(authInfo.username, authInfo.password);
      break;
    case event.path === "/items/refresh":
      responseCode = 200;
      responseBody = await refresh(authInfo.refreshtoken);
      break;
    case event.path === "/items/logout":
      responseCode = 200;
      responseBody = await logout(authInfo.refreshtoken);
      break;
  }

  return buildResponse(responseCode, responseBody);
};

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, ' +
                                      'X-Amz-Date, ' +
                                      'Authentication, ' +
                                      'Authorization, ' +
                                      'X-Api-Key, ' +
                                      'X-Amz-Security-Token'
    },
    body: JSON.stringify(body)
  };
};

async function logout(refreshToken) {
  var params = {
    ClientId: clientId,
    Token: refreshToken
  };
  let result = {'result': false, "data": "init"};
  await cognitoidentityserviceprovider.revokeToken(params).promise().then(
    (data) => {
      result.result = true;
      result.data = data;
    },
    (err) => {
      console.log(err);
      result.result = false;
      result.data = err;
    });

    return result;
}

async function refresh(refreshToken) {
  var params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      'Refresh_Token': refreshToken
    }
  };
  let result = {'result': false, "data": "init"};
  await cognitoidentityserviceprovider.adminInitiateAuth(params).promise().then(
    (data) => {
      result.result = true;
      result.data = data;
    },
    (err) => {
      console.log(err);
      result.result = false;
      result.data = err;
    });

    return result;
};

async function register(userName, password, email) {
  const params = {
    ClientId: clientId,
    Password: password,
    Username: userName,
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      },
    ]
  };
  let result = {'result': false, "data": "init"};
  await cognitoidentityserviceprovider.signUp(params).promise().then(
    (data) => {
      result.result = true;
      result.data = data;
    },
    (err) => {
      console.log(err);
      result.result = false;
      result.data = err;
    });
    return result;
};

async function login(email, password) {
  var params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      'EMAIL': email,
      'PASSWORD': password
    }
  };

  let result = {'result': false, "data": "init"};
  await cognitoidentityserviceprovider.adminInitiateAuth(params).promise().then(
    (data) => {
      result.result = true;
      result.data = data;
    },
    (err) => {
      console.log(err);
      result.result = false;
      result.data = err;
    });

    return result;
}
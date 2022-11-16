const AWS = require("aws-sdk");
// cisp = cognitoidentityserviceprovider
const cisp = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1'
});

const clientId = '19sg015uj1i7f1jedoagcvo9t9';
const userPoolId = 'us-east-1_Q5rfyIZ6x';

exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  console.log(event);
  console.log(requestBody.action);
  switch(true) {
    case requestBody.action === "setUserRole":
      console.log("action = setUserRole");
      await setUserRole(requestBody.userName, requestBody.roleName);
      break;
    case requestBody.action === "getUser":
      console.log("action = getUser");
      await getUser(requestBody.userName);
      break;
  }
  const response = {
    statusCode: 200,
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
    body: JSON.stringify('Something worked'),
  };
  return response;
};

async function setUserRole(userName, roleName) {
  console.log("function setUserRole");
  var params = {
    UserAttributes: [
      {
        Name: "custom:role",
        Value: roleName
      },
    ],
    UserPoolId: userPoolId,
    Username: userName
  };
  await cisp.adminUpdateUserAttributes(params).promise().then((data) =>{
    console.log("Role set successfully");
    console.log(data);
  })
  .then(getUser(userName))
  .catch ((error) => {
    console.log("KO");
    console.log(error)
  });
}

async function getUser(userName) {
  console.log("function getUser");
  var params = {
    UserPoolId: userPoolId,
    Username: userName
  };
  await cisp.adminGetUser(params).promise().then((data) =>{
    console.log("Successfully retrieved user");
    console.log(data);
  }, (error) => {
    console.log("KO");
    console.log(error);
  });
}

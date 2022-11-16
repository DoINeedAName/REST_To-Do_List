const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const cognitoProvider = new AWS.CognitoIdentityServiceProvider();
const path = "/items";
const tableName = "Items";

exports.handler = async (event) => {
  console.log('Request event: ', event);
  let response;

  console.log('Request event: ', event);
    let token = event.headers.Authorization;
    if (!token) {
        response = buildResponse(
            500,
            {'error': "no token received"}
        );
        return response;
    }

    let role = await getUserRole(token);
    const accessAllowed = ["admin"];
    if (!accessAllowed.includes(role)) {
        response = buildResponse(
            500,
            {'error': "resource not authorised for user"}
        );
        return response;
    }

    console.log("Role returned - " + role);

  let itemId = event.queryStringParameters.itemId;
  if(event.httpMethod === 'PUT' && event.path === path) {
    const requestBody = JSON.parse(event.body);
    console.log("retrieving params")
    const params = {
      TableName: tableName,
      Key: {
        "ItemID": parseInt(itemId)      
      },
      UpdateExpression: 'set #title = :title, ' +
                        '#details = :details, ' +
                        '#dueDate = :dueDate, ' +
                        '#completed = :completed',
      ExpressionAttributeValues: {
        ':title': requestBody.titleValue,
        ':details': requestBody.detailsValue,
        ':dueDate': requestBody.dueDateValue,
        ':completed': requestBody.completedValue
      },
      ExpressionAttributeNames: {
        "#title": requestBody.title,
        "#details": requestBody.details,
        "#dueDate": requestBody.dueDate,
        "#completed": requestBody.completed,
      },
      ReturnValues: 'UPDATED_NEW'
    };
    console.log("retrieved params");
    await docClient.update(params).promise().then((data) => {
      response = buildResponse(200, "Item updated successfully.");
      console.log('Updated successfully. ' + response);
      console.log(response);
    }, (error) => {
      console.error('Unable to update item. Error JSON: ', error);
      response = buildResponse(
        500,
        {'error': error}
      );
    });
  }
  console.log(response);
  return response;
};

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

async function getUserRole(token) {
  let getUserParams = {
      AccessToken: token
  };
  let userRole = null;
  await cognitoProvider.getUser(getUserParams).promise().then((data) => {
      console.log("Retreived user successfully");
      console.log(data);
      if(data.hasOwnProperty("UserAttributes")) {
          console.log("UserAttributes found");
          let attr = data.UserAttributes.find(function(ele) {
              return ele.Name === 'custom:role';
          });
          console.log(attr);
          if (attr) {
              userRole = attr.Value;
          }
      }
  }, (error) => {
      console.log("getUser failed");
      console.log(error);
  });
  
  console.log("userRole - " + userRole);
  return userRole;
}
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
    let token = event.headers.Authentication;
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
    if(event.httpMethod === 'DELETE' && event.path === path) {
        const params = {
            TableName: tableName,
            Key: {
                'ItemID': parseInt(itemId)
            }
        };

        await docClient.delete(params).promise().then((data) => {
            response = buildResponse(200, "Item deleted successfully");
            console.log('Deleted successfully. ' + response);
            console.log(response);
        }, (error) => {
            console.error('Unable to delete item. Error JSON: ', error);
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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
const AWS = require("aws-sdk");
// const {randomUUID} = require('crypto')

AWS.config.update({
    region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const itemsPath = "/list/readOne";
const tableName = "Items";

exports.handler = async (event) => {
    // console.log(randomUUID());
    // console.log("Request event: ", event);
    let response;

    // let itemID = event.queryStringParameters.itemID;
    if (event.httpMethod === 'GET' && event.path === itemsPath) {          
      let itemId = event.queryStringParameters && event.queryStringParameters.itemId
      console.log("ItemID is: " + itemId);
      const params = {
          TableName: tableName,
          Key: {
              "ItemID": parseInt(itemId)
          }
      };
      await docClient.get(params).promise().then((data) => {
          response = buildResponse(200, data.Item);
          console.log(data);
          console.log("Read successfully. " + response);
          console.log(response);
      }, (error) => {
          console.error('Unable to read item. Error JSON: ', error);
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
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body)
    };
};
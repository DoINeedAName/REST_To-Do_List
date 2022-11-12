const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const itemsPath = "/list/create";
const tableName = "Items";

exports.handler = async (event) => {
  console.log('Request event: ', event);
  let response = {init: "init value"};
  
  if(event.httpMethod === 'POST' && event.path === itemsPath) {
    const params = {
      TableName: tableName,
      Item: JSON.parse(event.body)
    };
    
    await docClient.put(params).promise().then((data) => {
      response = buildResponse(200, "item created successfully");
      console.log(data);
      console.log('Created successfully. ' + response);
      console.log(response);
    }, (error) => {
      console.error('Unable to create item. Error JSON: ', error);
      response = buildResponse(
        500,
        { 'error': error}
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
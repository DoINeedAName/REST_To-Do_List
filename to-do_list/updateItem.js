const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const path = "/list/update";
const tableName = "Items";

exports.handler = async (event) => {
  console.log('Request event: ', event);
  let response;
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
};
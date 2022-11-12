const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1"
});
const docClient = new AWS.DynamoDB.DocumentClient();
const path = "/list/delete";
const tableName = "Items";

exports.handler = async (event) => {
    console.log('Request event: ', event);
    let response;
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
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};
const {
  DynamoDBClient,
  ScanCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

const getPreferencies = async (idTelegram) => {
  const id = idTelegram.toString();
  const command = new ScanCommand({
    FilterExpression: "IdTelegram = :idTelegram",
    ExpressionAttributeValues: {
      ":idTelegram": { S: id },
    },
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
  });
  const response = await client.send(command);
  response.Items.forEach(function (item) {
    console.log(`${item}\n`);
  });
  return response.Items;
};

const describeTable = async () => {
  const command = new DescribeTableCommand({
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
  });

  const response = await client.send(command);
  console.log("responsedescribe", response.Table);
  console.log(`TABLE NAME: ${response.Table.TableName}`);
  console.log(`TABLE ITEM COUNT: ${response.Table.ItemCount}`);
  return response;
};

module.exports = {
  getPreferencies,
  describeTable,
};

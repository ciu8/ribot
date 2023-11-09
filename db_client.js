const {
  DynamoDBClient,
  ScanCommand,
  DescribeTableCommand,
  PutItemCommand,
  DeleteItemCommand,
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

const savePreference = async (preference) => {
  const { telegramId, nome, idScuola, idDieta, nome_scuola, nome_dieta } =
    preference;
  const command = new PutItemCommand({
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Item: {
      IdTelegram: { S: telegramId },
      Nome: { S: nome },
      IdScuola: { S: idScuola },
      IdDieta: { S: idDieta },
      NomeScuola: { S: nome_scuola },
      NomeDieta: { S: nome_dieta },
    },
  });
  const response = await client.send(command);
  return response;
};

const deletePreference = async (telegramId, byName) => {
  const user = {
    userid: { S: telegramId },
    name: { S: byName },
  };
  const command = new DeleteItemCommand({
    TableName: process.env.DYNAMO_DB_TABLE_NAME,
    Key: {
      IdTelegram: user.userid,
      Nome: user.name,
    },
  });

  const response = await client.send(command);
  return response;
};

module.exports = {
  getPreferencies,
  describeTable,
  savePreference,
  deletePreference,
};

import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// For raw client
const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fake",
    secretAccessKey: "fake"
  }
});

const command = new CreateTableCommand({
  TableName: "money",
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "createdDate", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "type", AttributeType: "S" },
    { AttributeName: "createdDate", AttributeType: "S"},
     { AttributeName: "userName", AttributeType: "S" }
    
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "TypeIndex",
      KeySchema: [
        { AttributeName: "type", KeyType: "HASH" }
      ],
      Projection: {
        ProjectionType: "ALL"
      }
    }, {
      IndexName: "CreatedDateIndex",
      KeySchema: [
        { AttributeName: "createdDate", KeyType: "HASH" }
      ],
      Projection: {
        ProjectionType: "ALL"
      },

    },
     {
      IndexName: "UserNameIndex",
      KeySchema: [
        { AttributeName: "userName", KeyType: "HASH" }
      ],
      Projection: {
        ProjectionType: "ALL"
      },

    },
    {
      IndexName: "TypeUserIndex",
      KeySchema: [
        { AttributeName: "userName", KeyType: "HASH" },
         { AttributeName: "type", KeyType: "RANGE" }
      ],
      Projection: {
        ProjectionType: "ALL"
      },

    }
    // ProvisionedThroughput 这儿不需要，PAY_PER_REQUEST 模式下


  ]/* ,
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  } */
});

(async () => {
  try {
    await client.send(command);
    console.log("✅ Table created.");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
})();

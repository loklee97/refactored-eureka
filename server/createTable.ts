import {
  CreateTableCommand,
  DescribeTableCommand
} from "@aws-sdk/client-dynamodb";
import docClient from "./db";

const tableName = "money";

const createTableCommand = new CreateTableCommand({
  TableName: tableName,
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" },
    { AttributeName: "createdDate", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "type", AttributeType: "S" },
    { AttributeName: "createdDate", AttributeType: "S" },
    { AttributeName: "userName", AttributeType: "S" }
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "TypeIndex",
      KeySchema: [
        { AttributeName: "type", KeyType: "HASH" }
      ],
      Projection: { ProjectionType: "ALL" }
    },
    {
      IndexName: "CreatedDateIndex",
      KeySchema: [
        { AttributeName: "createdDate", KeyType: "HASH" }
      ],
      Projection: { ProjectionType: "ALL" }
    },
    {
      IndexName: "UserNameIndex",
      KeySchema: [
        { AttributeName: "userName", KeyType: "HASH" }
      ],
      Projection: { ProjectionType: "ALL" }
    },
    {
      IndexName: "TypeUserIndex",
      KeySchema: [
        { AttributeName: "userName", KeyType: "HASH" },
        { AttributeName: "type", KeyType: "RANGE" }
      ],
      Projection: { ProjectionType: "ALL" }
    }
  ]
});

(async () => {
  try {
    await docClient.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("ℹ️ Table already exists. Skipping creation.");
  } catch (error: any) {
    if (error.name === "ResourceNotFoundException") {
      await docClient.send(createTableCommand);
      console.log("✅ Table created.");
    } else {
      console.error("❌ Unexpected error checking table:", error);
    }
  }
})();

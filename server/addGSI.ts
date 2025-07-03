import {
  DynamoDBClient,
  UpdateTableCommand
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "ap-southeast-1",
  endpoint: "http://localhost:8000", // DynamoDB Local 默认地址
  credentials: {
    accessKeyId: "fake",
    secretAccessKey: "fake"
  }
});

const command = new UpdateTableCommand({
  TableName: "money",
  AttributeDefinitions: [
    {
      AttributeName: "createdDate",
      AttributeType: "S" // ISO 字符串，用 S（String）
    }
  ],
  GlobalSecondaryIndexUpdates: [
    {
      Create: {
        IndexName: "CreatedDateIndex",
        KeySchema: [
          {
            AttributeName: "createdDate",
            KeyType: "HASH"
          }
        ],
        Projection: {
          ProjectionType: "ALL"
        }
        // 本地 DynamoDB 忽略这个字段，如果是 AWS 就要加上：
        // ProvisionedThroughput: {
        //   ReadCapacityUnits: 5,
        //   WriteCapacityUnits: 5
        // }
      }
    }
  ]
});

(async () => {
  try {
    const response = await client.send(command);
    console.log("GSI created:", response);
  } catch (error) {
    console.error("Error creating GSI:", error);
  }
})();

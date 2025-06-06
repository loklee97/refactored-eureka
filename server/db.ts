// server/db.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "fake",     // fake key
    secretAccessKey: "fake" // fake secret
  }
});

const docClient = DynamoDBDocumentClient.from(client);
export default docClient;

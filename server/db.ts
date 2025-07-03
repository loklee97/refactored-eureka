// server/db.ts
/* import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isLocal = process.env.NODE_ENV !== "production";

const docClient = new DynamoDBClient({
  region: isLocal ? "local" : (process.env.AWS_REGION || "us-east-1"),
  endpoint: isLocal ? "http://localhost:8000" : undefined,
  credentials: isLocal
    ? {
        accessKeyId: "fake",
        secretAccessKey: "fake",
      }
    : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
});
export default docClient;

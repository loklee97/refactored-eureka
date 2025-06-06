import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

async function listTables() {
  const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  });

  try {
    const command = new ListTablesCommand({});
    const result = await client.send(command);
    console.log("Current tables:", result.TableNames);
  } catch (err) {
    console.error("ListTables failed:", err);
  }
}

listTables();

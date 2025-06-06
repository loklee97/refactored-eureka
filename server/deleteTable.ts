import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

async function deleteTable(expenses: string) {
  const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
  });

  try {
    const command = new DeleteTableCommand({ TableName: expenses });
    const response = await client.send(command);
    console.log(`Table "${expenses}" deleted successfully.`);
    console.log(response);
  } catch (err) {
    console.error("Error deleting table:", err);
  }
}

// 替换成你想删的表名
deleteTable("money");

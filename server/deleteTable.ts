import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import docClient from "./db";
async function deleteTable(expenses: string) {
  

  try {
    const command = new DeleteTableCommand({ TableName: expenses });
    const response = await docClient.send(command);
    console.log(`Table "${expenses}" deleted successfully.`);
    console.log(response);
  } catch (err) {
    console.error("Error deleting table:", err);
  }
}
deleteTable("money");

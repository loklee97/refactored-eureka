import { QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import docClient from "./db";
import { Request, Response } from "express";
import { format } from "date-fns";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

export async function getAllMoney(): Promise<any[]> {
  try {
    const command = new ScanCommand({ TableName: "money" });
    const data = await docClient.send(command);
    return data.Items || [];
  } catch (error) {
    console.error("Error fetching money:", error);
    throw error;
  }
}
export interface getRecord {
  calculation: number;
  amount: number;
  name: string;
  description: string;
  id: string;
  categoryCode: string;
  updatedDate: string; // format "DD-MM-YYYY HH:mm"
  type: string;
  parentId: string;
}



export async function getDataByType(type: string): Promise<any[]> {
  try {


    const params: any = {
      TableName: "money",
      IndexName: "TypeIndex", // your GSI name
      KeyConditionExpression: "#t = :type",
      ExpressionAttributeNames: {
        "#t": "type"
      },
      ExpressionAttributeValues: {
        ":type": type  // 直接用字符串
      }
    };
    console.log(params);
    const data = await docClient.send(new QueryCommand(params));

    return data.Items || [];
  } catch (error) {
    console.error("Error fetching money:", error);
    throw error;
  }
}

export async function getDataByTypeUser(type: string, user: string): Promise<any[]> {
  try {


    const params: any = {
      TableName: "money",
      IndexName: "TypeUserIndex", // your GSI name
      KeyConditionExpression: "#type = :typeVal AND #user = :userVal",
      ExpressionAttributeNames: {
        "#type": "type",
        "#user": "userName"
      },
      ExpressionAttributeValues: {
        ":typeVal": type,
        ":userVal": user
      }
    };
    console.log(params);
    const data = await docClient.send(new QueryCommand(params));

    return data.Items || [];
  } catch (error) {
    console.error("Error fetching money:", error);
    throw error;
  }
}

export interface recalculate {
  oldCalculation: number;
  oldAmount: number;
  newCalculation: number;
  newAmount: number;
  user: string;
}

export async function recalculateMoney(recalculate: recalculate): Promise<boolean> {
  try {

    const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    const user = await getDataByType('User').then(x => x.find(user => user.userName === recalculate.user))
    const newMoney = user.money - (recalculate.oldAmount * recalculate.oldCalculation) + (recalculate.newAmount * recalculate.newCalculation);
    console.log('newmoney',newMoney)
    const params = {
      TableName: "money",
      Key: {
        id: user.id,
        createdDate: user.createdDate
      },
      UpdateExpression: `
        SET #upd = :updatedDate,
            #money = :money
      `,
      ExpressionAttributeNames: {
        "#upd": "updatedDate",
        "#money": "money"
      },
      ExpressionAttributeValues: {
        ":updatedDate": updatedDate,
        ":money": newMoney
      },
      ReturnValues: ReturnValue.NONE
    };
    console.log(params)
    await docClient.send(new UpdateCommand(params));
    return true;
  } catch (error) {
    console.error("Error fetching money:", error);
    throw error;
  }
}

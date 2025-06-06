// server/app.ts
//java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
//npx ts-node createTable.ts

import express from "express";
import docClient from "./db";
import { BatchWriteCommand, DeleteCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { format } from 'date-fns';
import { getAllMoney, getDataByType, getDataByTypeUser, recalculate, recalculateMoney } from "../server/getData";
import { stringToBytes } from "uuid/dist/cjs/v35";


const cors = require("cors");
const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());
const port = 3001;


// POST /expenses → Add a new expense
app.post("/expenses", async (req, res) => {
  try {
    const { userId, date, category, description, amount } = req.body;

    const command = new PutCommand({
      TableName: "expenses",
      Item: { userId, date, category, description, amount }
    });

    await docClient.send(command);
    res.status(201).json({ message: "Expense added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense." });
  }
});

// GET /expenses → List all expenses
app.get("/getAllMoney", async (_req, res) => {
  try {
    const command = new ScanCommand({ TableName: "money" });
    const data = await docClient.send(command);
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});


app.post('/api/createRecord', async (req, res) => {
  try {
    const { name, categoryCode, description, amount, calculation, parentId, userName } = req.body;
    const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    console.log('date' + updatedDate)
    const id = `R-${uuidv4()}-${updatedDate}`;
    console.log('id' + id)
    const createdDate = updatedDate
    const type = 'Record'
    const command = new PutCommand({
      TableName: "money",
      Item: { id, type, categoryCode, name, amount, description, calculation, parentId, updatedDate, createdDate, userName }
    });
    console.log(command)
    await docClient.send(command);
    const oldnew: recalculate = {
      oldCalculation: 0,
      oldAmount: 0,
      newCalculation: calculation,
      newAmount: amount,
      user: userName,
    };
    await recalculateMoney(oldnew);
    res.status(201).json({ message: "Expense added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense." });
  }
});


// 定义 schema

app.get("/api/getAllRecord", async (req: express.Request<{}, {}, {}, { type: string }>,
  res: express.Response) => {
  try {
    const query = req.query;
    console.log(typeof query)
    console.log(query)
    if (!query || typeof query.type !== "string") {
      return res.status(400).json({ error: "type is required and must be a string" });
    }
    const expenses = await getDataByType(query.type);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

app.get("/api/getAllRecordUser", async (req: express.Request<{}, {}, {}, { type: string, userName: string }>,
  res: express.Response) => {
  try {
    const query = req.query;
    console.log('typeof :',typeof query)
    console.log('request :',query)
    if (!query || typeof query.type !== "string" || typeof query.userName !== "string") {
      return res.status(400).json({ error: "type is required and must be a string" });
    }
    const expenses = await getDataByTypeUser(query.type, query.userName);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

app.post('/api/deleteRecord', async (req, res) => {
  try {

    const data = req.body;
    console.log(req)
    console.log(data)
    const deleteRequests = data.map((item: { id: string; createdDate: string }) => ({
      DeleteRequest: {
        Key: {
          id: item.id,
          createdDate: item.createdDate
        }
      }
    }));

    const params = {
      RequestItems: {
        money: deleteRequests
      }
    };

    const newAmount = data.reduce((sum: any, child: { amount: any; }) => sum + child.amount)
    const userName = data[0].userName
    console.log(data)
    console.log(userName)
    console.log(newAmount)
    const oldnew: recalculate = {
      oldCalculation: 0,
      oldAmount: 0,
      newCalculation: -1,
      newAmount: newAmount,
      user: userName,
    };
    await recalculateMoney(oldnew);

    await docClient.send(new BatchWriteCommand(params));
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed deleted ." });
  }
});

app.post('/api/updateRecord', async (req, res) => {
  try {
    const { name, categoryCode, description, amount, calculation, parentId, createdDate, id, user } = req.body;
    const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    const params = {
      TableName: "money",
      Key: {
        id: id,
        createdDate: createdDate,
      },
      UpdateExpression: `
    SET #n = :name,
        #amt = :amt,
        #desc = :desc,
        #cat = :categoryCode,
        #cal = :calculation,
        #pid = :parentId,
        #udt = :updatedDate,
        #user = :user,
  `,
      ExpressionAttributeNames: {
        "#n": "name",
        "#amt": "amount",
        "#desc": "description",
        "#cat": "categoryCode",
        "#cal": "calculation",
        "#pid": "parentId",
        "#udt": "updatedDate",
        "#user": ":user",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":amt": amount,
        ":desc": description,
        ":categoryCode": categoryCode,
        ":calculation": calculation,
        ":parentId": parentId,
        ":updatedDate": new Date().toISOString(),
        ":user ": user
      },
      ReturnValues: "UPDATED_NEW" as "UPDATED_NEW"
    };

    const result = await docClient.send(new UpdateCommand(params));
    const oldItem = result.Attributes;
    if (oldItem) {
      if (oldItem.amount !== amount) {

        user.money = user.money - (oldItem.amount * oldItem.calculation) + (amount * calculation)
        const oldnew: recalculate = {
          oldCalculation: oldItem.calculation,
          oldAmount: oldItem.amount,
          newCalculation: calculation,
          newAmount: amount,
          user: user,

        };
        await recalculateMoney(oldnew);
      }

    }
    res.status(200).json({ message: "Record updated successfully", result });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await getDataByType('User').then(x => x.find(user => user.userName === userName))

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const bcrypt = require('bcrypt');
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }



    return res.status(200).json({ message: 'Login successful', userName: user.userName, money: user.money });
  } catch (err) {
    res.status(500).json({ error: "Failed Login" });
  }
});



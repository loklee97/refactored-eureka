// server/app.ts
//java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
//npx ts-node createTable.ts

import express from "express";
import docClient from "./db";
import { BatchWriteCommand, DeleteCommand, GetCommand, GetCommandOutput, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { format } from 'date-fns';
import { getAllMoney, getDataByType, getDataByTypeUser, recalculate, recalculateMoney } from "./getData";

const cors = require("cors");
const app = express();
const allowedOrigins = [
  'http://localhost:5173',  // dev frontend
  'https://money-k3wb.vercel.app'  // deployed frontend
];

type user = {
  id: string,
  createdDate: string,
  type: string,
  userName: string,
  password: string,
  money: number
};

 async function createUser(userName: string, password: string): Promise<any> {
  try {
    const SECRET_KEY = 'hw9YcQrAJRyzJ+OmPZnmExhRzkEVvrXX3biIhWS6N6qXOltLbzNQJxdJg4q7Ka0+'
    const express = require('express');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const bodyParser = require('body-parser');
    const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    console.log('date' + updatedDate)
    const id = `U-${uuidv4()}-${updatedDate}`;


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: user = {
      id: id,
      createdDate: updatedDate,
      type: 'User',
      userName: userName,
      password: hashedPassword,
      money: 0
    }

    const result = await docClient.send(new PutCommand({
      TableName: "money",
      Item: newUser
    }));

    console.log("✅ Sample data inserted:", newUser);
    return true
  } catch (err) {
    console.error("❌ Failed to insert sample data:", err);
  }
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
}));
app.use(express.json());
const port = 3001;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

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

app.get("/getAllMoney", async (_req, res) => {
  try {
    const command = new ScanCommand({ TableName: "money" });
    const data = await docClient.send(command);
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
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
      oldAmount: 0,
      newAmount: amount * calculation,
      user: userName,
    };
    console.log('api create oldnew :', oldnew)
    await recalculateMoney(oldnew);
    res.status(201).json({ message: "Record added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add record." });
  }
});

app.get("/api/getAllRecord", async (req: express.Request<{}, {}, {}, { type: string }>,
  res: express.Response) => {
  try {
    const query = req.query;
    console.log(typeof query)
    console.log(query)
    if (!query || typeof query.type !== "string") {
      return res.status(400).json({ error: "type is required and must be a string" });
    }
    const record = await getDataByType(query.type);
    console.log('All record by type : ', record)
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch record." });
  }
});

app.get("/api/getAllRecordUser", async (req: express.Request<{}, {}, {}, { type: string, userName: string }>,
  res: express.Response) => {
  try {
    const query = req.query;
    console.log('typeof :', typeof query)
    console.log('request :', query)
    if (!query || typeof query.type !== "string" || typeof query.userName !== "string") {
      return res.status(400).json({ error: "type is required and must be a string" });
    }
    const record = await getDataByTypeUser(query.type, query.userName);
    console.log('All record by type and user: ', record)
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch record." });
  }
});

app.delete('/api/deleteRecord', async (req, res) => {
  try {
    const data = req.body;
    console.log('delete record data :', data)
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
    const newAmount = data.reduce((sum: number, child: { amount: any }) => {
      const amt = Number(child.amount);
      return sum + (isNaN(amt) ? 0 : amt); // ignore invalid numbers
    }, 0);
    const userName = data[0].userName
    console.log(data)
    console.log(userName)
    console.log('newamount : ', newAmount)
    const oldnew: recalculate = {
      oldAmount: newAmount,
      newAmount: 0,
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

app.patch('/api/updateRecord', async (req, res) => {
  try {
    const { name, categoryCode, description, amount, calculation, parentId, createdDate, id, userName } = req.body;
    //get old record
    const getParams = {
      TableName: "money",
      Key: {
        id: id,
        createdDate: createdDate,
      },
    };
    const old = await docClient.send(new GetCommand(getParams)) as GetCommandOutput;
    const oldData = old.Item;

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
        #userName = :userName
  `,
      ExpressionAttributeNames: {
        "#n": "name",
        "#amt": "amount",
        "#desc": "description",
        "#cat": "categoryCode",
        "#cal": "calculation",
        "#pid": "parentId",
        "#udt": "updatedDate",
        "#userName": "userName",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":amt": amount,
        ":desc": description,
        ":categoryCode": categoryCode,
        ":calculation": calculation,
        ":parentId": parentId,
        ":updatedDate": new Date().toISOString(),
        ":userName": userName
      },
      ReturnValues: "UPDATED_NEW" as "UPDATED_NEW"
    };
    const result = await docClient.send(new UpdateCommand(params));
    if (oldData) {
      if (oldData.amount !== amount) {
        const oldnew: recalculate = {
          oldAmount: oldData.amount * oldData.calculation,
          newAmount: amount * calculation,
          user: userName,
        };
        console.log('update money amount : ', oldnew)
        await recalculateMoney(oldnew);
      }

    }
    res.status(200).json({ message: "Record updated successfully" });
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

app.post('/api/createUser', async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await createUser(userName, password)
    res.status(201).json({ message: "User added." });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user." });
  }
});

app.post('/api/calculateTotal', async (req, res) => {
  try {
    const { userName } = req.body;
    console.log('userName : ', userName)
    const record = await getDataByType('Record').then(x => x.filter(user => user.userName === userName))
    console.log('record : ', record)


    if (!record || record.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    const sum = record.reduce((acc, item) => {
      return acc + (Number(item.amount) * Number(item.calculation));
    }, 0);
    console.log('sum : ', sum)
    const user = await getDataByType('User').then(x => x.find(user => user.userName === userName))
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    console.log("Updating user:", user);
    const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    const params = {
      TableName: "money",
      Key: {
        id: user.id,
        createdDate: user.createdDate,
      },
      UpdateExpression: `
    SET #money = :money,
        #udt = :updatedDate
  `,
      ExpressionAttributeNames: {
        "#money": "money",
        "#udt": "updatedDate",
      },
      ExpressionAttributeValues: {
        ":money": sum,
        ":updatedDate": updatedDate,
      },
      ReturnValues: "UPDATED_NEW" as "UPDATED_NEW"
    };
    console.log("param user:", params);
    const result = await docClient.send(new UpdateCommand(params));
    console.log('calculate result : ', result)
    return res.status(200).json(sum);
  } catch (err) {
    res.status(500).json({ error: "Failed Calculate" });
  }
});

app.get("/api/getMoneyByUser", async (req: express.Request<{}, {}, {}, { userName: string }>,
  res: express.Response) => {
  try {
    const query = req.query;
    console.log('typeof :', typeof query)
    console.log('request :', query)
    if (!query || typeof query.userName !== "string") {
      return res.status(400).json({ error: "type is required and must be a string" });
    }
    const user = await getDataByType('User').then(x => x.find(user => user.userName === query.userName))
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Money by user: ', user.money)
    res.json(user.money);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch record." });
  }
});
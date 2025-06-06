// server/insertSample.ts
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import docClient from "./db";
import { v4 as uuidv4 } from "uuid";
import { format } from 'date-fns';
// Sample expense data
type user = {
  id: string,
  createdDate: string,
  type: string,
  userName: string,
  password: string,
  money : number
};

const SECRET_KEY= 'hw9YcQrAJRyzJ+OmPZnmExhRzkEVvrXX3biIhWS6N6qXOltLbzNQJxdJg4q7Ka0+'
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

(async () => {
  try {

 const now = new Date();
    const updatedDate = format(now, 'dd-MM-yyyy HH:mm');
    console.log('date' + updatedDate)
    const id = `U-${uuidv4()}-${updatedDate}`;

    
    const hashedPassword = await bcrypt.hash('P@ssw0rd', 10);
    const newUser:user ={
      id: id,
      createdDate : updatedDate,
      type: 'User',
      userName :'GaoLao',
      password : hashedPassword,
      money : 0
    } 

    const result = await docClient.send(new PutCommand({
      TableName: "money",
      Item: newUser
    }));

    console.log("✅ Sample data inserted:", newUser);
  } catch (err) {
    console.error("❌ Failed to insert sample data:", err);
  }
})();

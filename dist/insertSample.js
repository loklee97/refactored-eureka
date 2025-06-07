"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
// server/insertSample.ts
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const db_1 = __importDefault(require("./db"));
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const SECRET_KEY = 'hw9YcQrAJRyzJ+OmPZnmExhRzkEVvrXX3biIhWS6N6qXOltLbzNQJxdJg4q7Ka0+';
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
/* (async () => {
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
})(); */
function createUser(userName, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const updatedDate = (0, date_fns_1.format)(now, 'dd-MM-yyyy HH:mm');
            console.log('date' + updatedDate);
            const id = `U-${(0, uuid_1.v4)()}-${updatedDate}`;
            const hashedPassword = yield bcrypt.hash(password, 10);
            const newUser = {
                id: id,
                createdDate: updatedDate,
                type: 'User',
                userName: userName,
                password: hashedPassword,
                money: 0
            };
            const result = yield db_1.default.send(new lib_dynamodb_1.PutCommand({
                TableName: "money",
                Item: newUser
            }));
            console.log("✅ Sample data inserted:", newUser);
            return true;
        }
        catch (err) {
            console.error("❌ Failed to insert sample data:", err);
        }
    });
}

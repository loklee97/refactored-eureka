"use strict";
// server/app.ts
//java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
//npx ts-node createTable.ts
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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const getData_1 = require("./getData");
const cors = require("cors");
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:5173', // dev frontend
    'https://money-k3wb.vercel.app' // deployed frontend
];
function createUser(userName, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const SECRET_KEY = 'hw9YcQrAJRyzJ+OmPZnmExhRzkEVvrXX3biIhWS6N6qXOltLbzNQJxdJg4q7Ka0+';
            const express = require('express');
            const bcrypt = require('bcrypt');
            const jwt = require('jsonwebtoken');
            const bodyParser = require('body-parser');
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
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
}));
app.use(express_1.default.json());
const port = 3001;
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
app.post("/expenses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, date, category, description, amount } = req.body;
        const command = new lib_dynamodb_1.PutCommand({
            TableName: "expenses",
            Item: { userId, date, category, description, amount }
        });
        yield db_1.default.send(command);
        res.status(201).json({ message: "Expense added." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add expense." });
    }
}));
app.get("/getAllMoney", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new lib_dynamodb_1.ScanCommand({ TableName: "money" });
        const data = yield db_1.default.send(command);
        res.json(data.Items);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch expenses." });
    }
}));
app.post('/api/createRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, categoryCode, description, amount, calculation, parentId, userName } = req.body;
        const now = new Date();
        const updatedDate = (0, date_fns_1.format)(now, 'dd-MM-yyyy HH:mm');
        console.log('date' + updatedDate);
        const id = `R-${(0, uuid_1.v4)()}-${updatedDate}`;
        console.log('id' + id);
        const createdDate = updatedDate;
        const type = 'Record';
        const command = new lib_dynamodb_1.PutCommand({
            TableName: "money",
            Item: { id, type, categoryCode, name, amount, description, calculation, parentId, updatedDate, createdDate, userName }
        });
        console.log(command);
        yield db_1.default.send(command);
        const oldnew = {
            oldAmount: 0,
            newAmount: amount * calculation,
            user: userName,
        };
        console.log('api create oldnew :', oldnew);
        yield (0, getData_1.recalculateMoney)(oldnew);
        res.status(201).json({ message: "Record added." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add record." });
    }
}));
app.get("/api/getAllRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        console.log(typeof query);
        console.log(query);
        if (!query || typeof query.type !== "string") {
            return res.status(400).json({ error: "type is required and must be a string" });
        }
        const record = yield (0, getData_1.getDataByType)(query.type);
        console.log('All record by type : ', record);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch record." });
    }
}));
app.get("/api/getAllRecordUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        console.log('typeof :', typeof query);
        console.log('request :', query);
        if (!query || typeof query.type !== "string" || typeof query.userName !== "string") {
            return res.status(400).json({ error: "type is required and must be a string" });
        }
        const record = yield (0, getData_1.getDataByTypeUser)(query.type, query.userName);
        console.log('All record by type and user: ', record);
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch record." });
    }
}));
app.delete('/api/deleteRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        console.log('delete record data :', data);
        const deleteRequests = data.map((item) => ({
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
        const newAmount = data.reduce((sum, child) => {
            const amt = Number(child.amount);
            return sum + (isNaN(amt) ? 0 : amt); // ignore invalid numbers
        }, 0);
        const userName = data[0].userName;
        console.log(data);
        console.log(userName);
        console.log('newamount : ', newAmount);
        const oldnew = {
            oldAmount: newAmount,
            newAmount: 0,
            user: userName,
        };
        yield (0, getData_1.recalculateMoney)(oldnew);
        yield db_1.default.send(new lib_dynamodb_1.BatchWriteCommand(params));
        res.status(200).json({ message: "Item deleted successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed deleted ." });
    }
}));
app.patch('/api/updateRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const old = yield db_1.default.send(new lib_dynamodb_1.GetCommand(getParams));
        const oldData = old.Item;
        const now = new Date();
        const updatedDate = (0, date_fns_1.format)(now, 'dd-MM-yyyy HH:mm');
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
            ReturnValues: "UPDATED_NEW"
        };
        const result = yield db_1.default.send(new lib_dynamodb_1.UpdateCommand(params));
        if (oldData) {
            if (oldData.amount !== amount) {
                const oldnew = {
                    oldAmount: oldData.amount * oldData.calculation,
                    newAmount: amount * calculation,
                    user: userName,
                };
                console.log('update money amount : ', oldnew);
                yield (0, getData_1.recalculateMoney)(oldnew);
            }
        }
        res.status(200).json({ message: "Record updated successfully" });
    }
    catch (error) {
        console.error("Update failed:", error);
        res.status(500).json({ error: "Failed to update record" });
    }
}));
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, password } = req.body;
        const user = yield (0, getData_1.getDataByType)('User').then(x => x.find(user => user.userName === userName));
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const bcrypt = require('bcrypt');
        const passwordMatch = yield bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        return res.status(200).json({ message: 'Login successful', userName: user.userName, money: user.money });
    }
    catch (err) {
        res.status(500).json({ error: "Failed Login" });
    }
}));
app.post('/api/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, password } = req.body;
        const user = yield createUser(userName, password);
        res.status(201).json({ message: "User added." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add user." });
    }
}));
app.post('/api/calculateTotal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName } = req.body;
        console.log('userName : ', userName);
        const record = yield (0, getData_1.getDataByType)('Record').then(x => x.filter(user => user.userName === userName));
        console.log('record : ', record);
        if (!record || record.length === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }
        const sum = record.reduce((acc, item) => {
            return acc + (Number(item.amount) * Number(item.calculation));
        }, 0);
        console.log('sum : ', sum);
        const user = yield (0, getData_1.getDataByType)('User').then(x => x.find(user => user.userName === userName));
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        console.log("Updating user:", user);
        const now = new Date();
        const updatedDate = (0, date_fns_1.format)(now, 'dd-MM-yyyy HH:mm');
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
            ReturnValues: "UPDATED_NEW"
        };
        console.log("param user:", params);
        const result = yield db_1.default.send(new lib_dynamodb_1.UpdateCommand(params));
        console.log('calculate result : ', result);
        return res.status(200).json(sum);
    }
    catch (err) {
        res.status(500).json({ error: "Failed Calculate" });
    }
}));
app.get("/api/getMoneyByUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        console.log('typeof :', typeof query);
        console.log('request :', query);
        if (!query || typeof query.userName !== "string") {
            return res.status(400).json({ error: "type is required and must be a string" });
        }
        const user = yield (0, getData_1.getDataByType)('User').then(x => x.find(user => user.userName === query.userName));
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        console.log('Money by user: ', user.money);
        res.json(user.money);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch record." });
    }
}));

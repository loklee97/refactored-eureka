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
const insertSample_1 = require("./insertSample");
const cors = require("cors");
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:5173', // dev frontend
    'https://money-k3wb.vercel.app' // deployed frontend
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            callback(null, true);
        else
            callback(new Error('Not allowed by CORS'));
    }
}));
app.use(express_1.default.json());
const port = 3001;
// POST /expenses → Add a new expense
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
// GET /expenses → List all expenses
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
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
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
            oldCalculation: 0,
            oldAmount: 0,
            newCalculation: calculation,
            newAmount: amount,
            user: userName,
        };
        yield (0, getData_1.recalculateMoney)(oldnew);
        res.status(201).json({ message: "Expense added." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add expense." });
    }
}));
// 定义 schema
app.get("/api/getAllRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        console.log(typeof query);
        console.log(query);
        if (!query || typeof query.type !== "string") {
            return res.status(400).json({ error: "type is required and must be a string" });
        }
        const expenses = yield (0, getData_1.getDataByType)(query.type);
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses." });
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
        const expenses = yield (0, getData_1.getDataByTypeUser)(query.type, query.userName);
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses." });
    }
}));
app.post('/api/deleteRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        console.log(req);
        console.log(data);
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
        const newAmount = data.reduce((sum, child) => sum + child.amount);
        const userName = data[0].userName;
        console.log(data);
        console.log(userName);
        console.log(newAmount);
        const oldnew = {
            oldCalculation: 0,
            oldAmount: 0,
            newCalculation: -1,
            newAmount: newAmount,
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
app.post('/api/updateRecord', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, categoryCode, description, amount, calculation, parentId, createdDate, id, user } = req.body;
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
            ReturnValues: "UPDATED_NEW"
        };
        const result = yield db_1.default.send(new lib_dynamodb_1.UpdateCommand(params));
        const oldItem = result.Attributes;
        if (oldItem) {
            if (oldItem.amount !== amount) {
                user.money = user.money - (oldItem.amount * oldItem.calculation) + (amount * calculation);
                const oldnew = {
                    oldCalculation: oldItem.calculation,
                    oldAmount: oldItem.amount,
                    newCalculation: calculation,
                    newAmount: amount,
                    user: user,
                };
                yield (0, getData_1.recalculateMoney)(oldnew);
            }
        }
        res.status(200).json({ message: "Record updated successfully", result });
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
        const user = yield (0, insertSample_1.createUser)(userName, password);
        res.status(201).json({ message: "User added." });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add expense." });
    }
}));

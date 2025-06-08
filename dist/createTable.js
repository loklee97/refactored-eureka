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
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const db_1 = __importDefault(require("./db"));
const tableName = "money";
const createTableCommand = new client_dynamodb_1.CreateTableCommand({
    TableName: tableName,
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" },
        { AttributeName: "createdDate", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "type", AttributeType: "S" },
        { AttributeName: "createdDate", AttributeType: "S" },
        { AttributeName: "userName", AttributeType: "S" }
    ],
    BillingMode: "PAY_PER_REQUEST",
    GlobalSecondaryIndexes: [
        {
            IndexName: "TypeIndex",
            KeySchema: [
                { AttributeName: "type", KeyType: "HASH" }
            ],
            Projection: { ProjectionType: "ALL" }
        },
        {
            IndexName: "CreatedDateIndex",
            KeySchema: [
                { AttributeName: "createdDate", KeyType: "HASH" }
            ],
            Projection: { ProjectionType: "ALL" }
        },
        {
            IndexName: "UserNameIndex",
            KeySchema: [
                { AttributeName: "userName", KeyType: "HASH" }
            ],
            Projection: { ProjectionType: "ALL" }
        },
        {
            IndexName: "TypeUserIndex",
            KeySchema: [
                { AttributeName: "userName", KeyType: "HASH" },
                { AttributeName: "type", KeyType: "RANGE" }
            ],
            Projection: { ProjectionType: "ALL" }
        }
    ]
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.send(new client_dynamodb_1.DescribeTableCommand({ TableName: tableName }));
        console.log("ℹ️ Table already exists. Skipping creation.");
    }
    catch (error) {
        if (error.name === "ResourceNotFoundException") {
            yield db_1.default.send(createTableCommand);
            console.log("✅ Table created.");
        }
        else {
            console.error("❌ Unexpected error checking table:", error);
        }
    }
}))();

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
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_dynamodb_2 = require("@aws-sdk/client-dynamodb");
// For raw client
const client = new client_dynamodb_2.DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "fake",
        secretAccessKey: "fake"
    }
});
const command = new client_dynamodb_1.CreateTableCommand({
    TableName: "money",
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
            Projection: {
                ProjectionType: "ALL"
            }
        }, {
            IndexName: "CreatedDateIndex",
            KeySchema: [
                { AttributeName: "createdDate", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: "ALL"
            },
        },
        {
            IndexName: "UserNameIndex",
            KeySchema: [
                { AttributeName: "userName", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: "ALL"
            },
        },
        {
            IndexName: "TypeUserIndex",
            KeySchema: [
                { AttributeName: "userName", KeyType: "HASH" },
                { AttributeName: "type", KeyType: "RANGE" }
            ],
            Projection: {
                ProjectionType: "ALL"
            },
        }
        // ProvisionedThroughput 这儿不需要，PAY_PER_REQUEST 模式下
    ] /* ,
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    } */
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.send(command);
        console.log("✅ Table created.");
    }
    catch (err) {
        console.error("❌ Error creating table:", err);
    }
}))();

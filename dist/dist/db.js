"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/db.ts
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
    credentials: {
        accessKeyId: "fake", // fake key
        secretAccessKey: "fake" // fake secret
    }
});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.default = docClient;

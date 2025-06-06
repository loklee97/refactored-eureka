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
const client = new client_dynamodb_1.DynamoDBClient({
    region: "ap-southeast-1",
    endpoint: "http://localhost:8000", // DynamoDB Local 默认地址
    credentials: {
        accessKeyId: "fake",
        secretAccessKey: "fake"
    }
});
const command = new client_dynamodb_1.UpdateTableCommand({
    TableName: "money",
    AttributeDefinitions: [
        {
            AttributeName: "createdDate",
            AttributeType: "S" // ISO 字符串，用 S（String）
        }
    ],
    GlobalSecondaryIndexUpdates: [
        {
            Create: {
                IndexName: "CreatedDateIndex",
                KeySchema: [
                    {
                        AttributeName: "createdDate",
                        KeyType: "HASH"
                    }
                ],
                Projection: {
                    ProjectionType: "ALL"
                }
                // 本地 DynamoDB 忽略这个字段，如果是 AWS 就要加上：
                // ProvisionedThroughput: {
                //   ReadCapacityUnits: 5,
                //   WriteCapacityUnits: 5
                // }
            }
        }
    ]
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield client.send(command);
        console.log("GSI created:", response);
    }
    catch (error) {
        console.error("Error creating GSI:", error);
    }
}))();

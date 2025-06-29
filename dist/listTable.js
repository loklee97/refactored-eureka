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
function listTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new client_dynamodb_1.DynamoDBClient({
            region: "local",
            endpoint: "http://localhost:8000",
            credentials: {
                accessKeyId: "fake",
                secretAccessKey: "fake",
            },
        });
        try {
            const command = new client_dynamodb_1.ListTablesCommand({});
            const result = yield client.send(command);
            console.log("Current tables:", result.TableNames);
        }
        catch (err) {
            console.error("ListTables failed:", err);
        }
    });
}
listTables();

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
function deleteTable(expenses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = new client_dynamodb_1.DeleteTableCommand({ TableName: expenses });
            const response = yield db_1.default.send(command);
            console.log(`Table "${expenses}" deleted successfully.`);
            console.log(response);
        }
        catch (err) {
            console.error("Error deleting table:", err);
        }
    });
}
// 替换成你想删的表名
deleteTable("money");

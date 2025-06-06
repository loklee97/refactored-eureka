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
exports.getAllMoney = getAllMoney;
exports.getDataByType = getDataByType;
exports.getDataByTypeUser = getDataByTypeUser;
exports.recalculateMoney = recalculateMoney;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const db_1 = __importDefault(require("./db"));
const date_fns_1 = require("date-fns");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
function getAllMoney() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = new lib_dynamodb_1.ScanCommand({ TableName: "money" });
            const data = yield db_1.default.send(command);
            return data.Items || [];
        }
        catch (error) {
            console.error("Error fetching money:", error);
            throw error;
        }
    });
}
function getDataByType(type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                TableName: "money",
                IndexName: "TypeIndex", // your GSI name
                KeyConditionExpression: "#t = :type",
                ExpressionAttributeNames: {
                    "#t": "type"
                },
                ExpressionAttributeValues: {
                    ":type": type // 直接用字符串
                }
            };
            console.log(params);
            const data = yield db_1.default.send(new lib_dynamodb_1.QueryCommand(params));
            return data.Items || [];
        }
        catch (error) {
            console.error("Error fetching money:", error);
            throw error;
        }
    });
}
function getDataByTypeUser(type, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                TableName: "money",
                IndexName: "TypeUserIndex", // your GSI name
                KeyConditionExpression: "#type = :typeVal AND #user = :userVal",
                ExpressionAttributeNames: {
                    "#type": "type",
                    "#user": "userName"
                },
                ExpressionAttributeValues: {
                    ":typeVal": type,
                    ":userVal": user
                }
            };
            console.log(params);
            const data = yield db_1.default.send(new lib_dynamodb_1.QueryCommand(params));
            return data.Items || [];
        }
        catch (error) {
            console.error("Error fetching money:", error);
            throw error;
        }
    });
}
function recalculateMoney(recalculate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const updatedDate = (0, date_fns_1.format)(now, 'dd-MM-yyyy HH:mm');
            const user = yield getDataByType('User').then(x => x.find(user => user.userName === recalculate.user));
            const newMoney = user.money - (recalculate.oldAmount * recalculate.oldCalculation) + (recalculate.newAmount * recalculate.newCalculation);
            console.log('newmoney', newMoney);
            const params = {
                TableName: "money",
                Key: {
                    id: user.id,
                    createdDate: user.createdDate
                },
                UpdateExpression: `
        SET #upd = :updatedDate,
            #money = :money
      `,
                ExpressionAttributeNames: {
                    "#upd": "updatedDate",
                    "#money": "money"
                },
                ExpressionAttributeValues: {
                    ":updatedDate": updatedDate,
                    ":money": newMoney
                },
                ReturnValues: client_dynamodb_1.ReturnValue.NONE
            };
            console.log(params);
            yield db_1.default.send(new lib_dynamodb_1.UpdateCommand(params));
            return true;
        }
        catch (error) {
            console.error("Error fetching money:", error);
            throw error;
        }
    });
}

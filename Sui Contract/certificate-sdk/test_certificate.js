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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@mysten/sui/client");
var utils_1 = require("@mysten/sui/utils");
var transactions_1 = require("@mysten/sui/transactions");
var ed25519_1 = require("@mysten/sui/keypairs/ed25519");
var secretKey = "ec973ade8857a69ae5bdd5414e4636b9340c708dec16d961feaf2b48defe00bb";
var bytes32Key = Buffer.from(secretKey, "hex");
var keypair = ed25519_1.Ed25519Keypair.fromSecretKey(bytes32Key);
var MY_ADDRESS = keypair.getPublicKey().toSuiAddress();
var PACKAGE_ID = "0xa07b80f6e13a408cf659ce5994243cffeb43e3febb537e27c06cc58545346608";
var MODULE_NAME = "certificate_system";
console.log("Transaction Initiaded From: ", MY_ADDRESS);
var test_client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)("testnet") });
function authorize_issuer() {
    return __awaiter(this, void 0, void 0, function () {
        var tx, startTime, result, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tx = new transactions_1.Transaction();
                    startTime = performance.now();
                    tx.moveCall({
                        target: "".concat(PACKAGE_ID, "::").concat(MODULE_NAME, "::").concat("authorize_issuer"),
                        arguments: [
                            tx.object("0x6cf58d956a7143c3c1a277c200f34df194f3373c41071a8dde341f68c6611e22"),
                            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
                            tx.pure.address("0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1"),
                            tx.pure.string("Tasfia tasnim")
                        ],
                    });
                    return [4 /*yield*/, test_client.signAndExecuteTransaction({
                            transaction: tx,
                            signer: keypair,
                        })];
                case 1:
                    result = _a.sent();
                    endTime = performance.now();
                    console.log("✅ Transaction Success:", result);
                    console.log("\u23F3 Execution Time: ".concat((endTime - startTime).toFixed(2), " ms"));
                    return [2 /*return*/];
            }
        });
    });
}
function Issue_certificate() {
    return __awaiter(this, void 0, void 0, function () {
        var tx, startTime, result, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tx = new transactions_1.Transaction();
                    startTime = performance.now();
                    tx.moveCall({
                        target: "".concat(PACKAGE_ID, "::").concat("certificate_system", "::").concat("issue_certificate"),
                        arguments: [
                            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
                            tx.pure.string("Alice"),
                            tx.pure.string("BS in CS"),
                            tx.pure.u64(2524608000000),
                            tx.pure.string("https://www.edrawsoft.com/templates/images/student-excellent-award.png"),
                            tx.object(utils_1.SUI_CLOCK_OBJECT_ID),
                        ],
                    });
                    return [4 /*yield*/, test_client.signAndExecuteTransaction({
                            transaction: tx,
                            signer: keypair,
                        })];
                case 1:
                    result = _a.sent();
                    endTime = performance.now();
                    console.log("✅ Transaction Success:", result);
                    console.log("\u23F3 Execution Time: ".concat((endTime - startTime).toFixed(2), " ms"));
                    return [2 /*return*/];
            }
        });
    });
}
function Check_Scalability() {
    return __awaiter(this, void 0, void 0, function () {
        var tx, startTime, result, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tx = new transactions_1.Transaction();
                    startTime = performance.now();
                    tx.moveCall({
                        target: "".concat(PACKAGE_ID, "::").concat("certificate_system", "::").concat("issue_100_certificate"),
                        arguments: [
                            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
                            tx.pure.string("Alice"),
                            tx.pure.string("BS in CS"),
                            tx.pure.u64(2524608000000),
                            tx.pure.string("https://www.edrawsoft.com/templates/images/student-excellent-award.png"),
                            tx.object(utils_1.SUI_CLOCK_OBJECT_ID),
                        ],
                    });
                    return [4 /*yield*/, test_client.signAndExecuteTransaction({
                            transaction: tx,
                            signer: keypair,
                        })];
                case 1:
                    result = _a.sent();
                    endTime = performance.now();
                    console.log("✅ Transaction Success:", result);
                    console.log("\u23F3 Execution Time: ".concat((endTime - startTime).toFixed(2), " ms"));
                    return [2 /*return*/];
            }
        });
    });
}
function Revoke_certificate() {
    return __awaiter(this, void 0, void 0, function () {
        var tx, startTime, result, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tx = new transactions_1.Transaction();
                    startTime = performance.now();
                    tx.moveCall({
                        target: "".concat(PACKAGE_ID, "::").concat("certificate_system", "::").concat("revoke_certificate"),
                        arguments: [
                            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
                            tx.pure.address("0xc31a415100e57a8a5ed679c297f81ea8f7b1b83a6477f3849ef7c162bcd3041d"),
                        ],
                    });
                    return [4 /*yield*/, test_client.signAndExecuteTransaction({
                            transaction: tx,
                            signer: keypair,
                        })];
                case 1:
                    result = _a.sent();
                    endTime = performance.now();
                    console.log("✅ Transaction Success:", result);
                    console.log("\u23F3 Execution Time: ".concat((endTime - startTime).toFixed(2), " ms"));
                    return [2 /*return*/];
            }
        });
    });
}
function Verify_certificate() {
    return __awaiter(this, void 0, void 0, function () {
        var tx, startTime, result, endTime, return_values;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    tx = new transactions_1.Transaction();
                    startTime = performance.now();
                    tx.moveCall({
                        target: "".concat(PACKAGE_ID, "::").concat("certificate_system", "::").concat("verify_certificate"),
                        arguments: [
                            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
                            tx.pure.address("0xc31a415100e57a8a5ed679c297f81ea8f7b1b83a6477f3849ef7c162bcd3041d"),
                            tx.object(utils_1.SUI_CLOCK_OBJECT_ID),
                        ],
                    });
                    return [4 /*yield*/, test_client.devInspectTransactionBlock({
                            transactionBlock: tx,
                            sender: MY_ADDRESS,
                        })];
                case 1:
                    result = _c.sent();
                    endTime = performance.now();
                    console.log("✅ Transaction Success:", result);
                    console.log("\u23F3 Execution Time: ".concat((endTime - startTime).toFixed(2), " ms"));
                    return_values = (_b = (_a = result === null || result === void 0 ? void 0 : result.results) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.returnValues;
                    console.log(return_values);
                    return [2 /*return*/];
            }
        });
    });
}
function convertSuiReturnValues(returnValues) {
    return returnValues.map(function (_a) {
        var value = _a[0], type = _a[1];
        if (type === "bool") {
            return value[0] === 1 ? true : false;
        }
        else if (type === "0x1::string::String") {
            return String.fromCharCode.apply(String, value);
        }
        return value; // Return original value if not a recognized type
    });
}
// authorize_issuer();
// Issue_certificate();
// Verify_certificate()
// Revoke_certificate()
Check_Scalability();

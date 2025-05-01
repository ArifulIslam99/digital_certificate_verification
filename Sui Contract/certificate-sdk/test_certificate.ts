import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import fs from "fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
const secretKey: any = "ec973ade8857a69ae5bdd5414e4636b9340c708dec16d961feaf2b48defe00bb";
let bytes32Key = Buffer.from(secretKey, "hex");
const keypair = Ed25519Keypair.fromSecretKey(bytes32Key);
const MY_ADDRESS = keypair.getPublicKey().toSuiAddress();
const PACKAGE_ID = "0xa07b80f6e13a408cf659ce5994243cffeb43e3febb537e27c06cc58545346608";
const MODULE_NAME = "certificate_system";
console.log("Transaction Initiaded From: ", MY_ADDRESS);

const test_client = new SuiClient({ url: getFullnodeUrl("testnet") });

async function authorize_issuer() {
    const tx = new Transaction();
    const startTime = performance.now();
    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::${"authorize_issuer"}`,
        arguments: [
            tx.object("0x6cf58d956a7143c3c1a277c200f34df194f3373c41071a8dde341f68c6611e22"),
            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
            tx.pure.address("0xe86e9c41dca2f50ace7e646856ef3ee02f7c5754d74da95fe64a522dfc72f2a1"),
            tx.pure.string("Tasfia tasnim")
        ],
    });

    const result = await test_client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
    });

    const endTime = performance.now();
    console.log("✅ Transaction Success:", result);
    console.log(`⏳ Execution Time: ${(endTime - startTime).toFixed(2)} ms`);
}

async function Issue_certificate() {

    const tx = new Transaction();
    const startTime = performance.now();

    tx.moveCall({
        target: `${PACKAGE_ID}::${"certificate_system"}::${"issue_certificate"}`,
        arguments: [
            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
            tx.pure.string("Alice"),
            tx.pure.string("BS in CS"),
            tx.pure.u64(2524608000000),
            tx.pure.string("https://www.edrawsoft.com/templates/images/student-excellent-award.png"),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    const result = await test_client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
    });

    // End execution timer
    const endTime = performance.now();
    console.log("✅ Transaction Success:", result);
    console.log(`⏳ Execution Time: ${(endTime - startTime).toFixed(2)} ms`);
}

async function Check_Scalability() {

    const tx = new Transaction();
    const startTime = performance.now();

    tx.moveCall({
        target: `${PACKAGE_ID}::${"certificate_system"}::${"issue_100_certificate"}`,
        arguments: [
            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
            tx.pure.string("Alice"),
            tx.pure.string("BS in CS"),
            tx.pure.u64(2524608000000),
            tx.pure.string("https://www.edrawsoft.com/templates/images/student-excellent-award.png"),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    const result = await test_client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
    });

    // End execution timer
    const endTime = performance.now();
    console.log("✅ Transaction Success:", result);
    console.log(`⏳ Execution Time: ${(endTime - startTime).toFixed(2)} ms`);
}

async function Revoke_certificate() {

    const tx = new Transaction();
    const startTime = performance.now();

    tx.moveCall({
        target: `${PACKAGE_ID}::${"certificate_system"}::${"revoke_certificate"}`,
        arguments: [
            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
            tx.pure.address("0xc31a415100e57a8a5ed679c297f81ea8f7b1b83a6477f3849ef7c162bcd3041d"),
        ],
    });

    const result = await test_client.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
    });

    // End execution timer
    const endTime = performance.now();
    console.log("✅ Transaction Success:", result);
    console.log(`⏳ Execution Time: ${(endTime - startTime).toFixed(2)} ms`);
}

async function Verify_certificate() {

    const tx = new Transaction();
    const startTime = performance.now();

    tx.moveCall({
        target: `${PACKAGE_ID}::${"certificate_system"}::${"verify_certificate"}`,
        arguments: [
            tx.object("0xbccbed3ea0548d62a78b1a7bee043b5969455b8bed4a36b5dccd3e5872b334f2"),
            tx.pure.address("0xc31a415100e57a8a5ed679c297f81ea8f7b1b83a6477f3849ef7c162bcd3041d"),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    const result = await test_client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: MY_ADDRESS,
    });

    // End execution timer
    const endTime = performance.now();
    console.log("✅ Transaction Success:", result);
    console.log(`⏳ Execution Time: ${(endTime - startTime).toFixed(2)} ms`);

    const return_values: any = result?.results?.[0]?.returnValues
    console.log(return_values)
}

function convertSuiReturnValues(returnValues: any[]): any[] {
    return returnValues.map(([value, type]) => {
        if (type === "bool") {
            return value[0] === 1 ? true : false;
        } else if (type === "0x1::string::String") {
            return String.fromCharCode(...value);
        }
        return value; // Return original value if not a recognized type
    });
}



// authorize_issuer();
// Issue_certificate();
// Verify_certificate()
// Revoke_certificate()
Check_Scalability()




import { SHA256 } from "crypto-js";
import { Pool } from "pg";

function generateHex(size: number) {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  
    for (let i = 0; i < size; ++i) {
        result.push(hexRef[Math.floor(Math.random() * 16)]);
    }

    return result.join('');
}

function escapeElement(elementRepresentation: string) {
    var escaped = elementRepresentation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
    return '"' + escaped + '"';
}

export async function generateQr(db: Pool, table: string) {
    let qr;

    for (let i = 0; i < 3; ++i) {
        qr = generateHex(64);

        if (!(await db.query(`SELECT id FROM ${
            escapeElement(table)
        } WHERE qr = $1`, [qr])).rows[0]) {
            return SHA256(qr!).toString();
        }
    }

    return null;
}
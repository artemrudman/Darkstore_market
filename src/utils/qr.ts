import { SHA256 } from "crypto-js";
import { Pool } from "pg";

function generateData() {
    const chars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let result = '';

    for (let i = 0; i < 64; ++i) {
        result += chars[Math.floor(Math.random() * 94)];
    }

    return result;
}

function escapeElement(element: string) {
    return '"' + element.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

export async function generateQr(db: Pool, table: string) {
    let qr;

    for (let i = 0; i < 3; ++i) {
        qr = generateData();

        if (!(await db.query(`SELECT id FROM ${
            escapeElement(table)
        } WHERE qr = $1`, [SHA256(qr).toString()])).rows[0]) {
            return qr;
        }
    }

    return null;
} 
import { SHA256 } from "crypto-js";
import { Pool } from "pg";

// TODO: Генерировать строку из рандомных символов

function generateHex() {
    const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let result = [];

    for (let i = 0; i < 64; ++i) {
        result.push(hexRef[Math.floor(Math.random() * 16)]);
    }

    return result.join('');
}

function escapeElement(element: string) {
    return '"' + element.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

export async function generateQr(db: Pool, table: string) {
    let qr;

    for (let i = 0; i < 3; ++i) {
        qr = SHA256(generateHex()).toString();

        if (!(await db.query(`SELECT id FROM ${
            escapeElement(table)
        } WHERE qr = $1`, [qr])).rows[0]) {
            return qr;
        }
    }

    return null;
} 
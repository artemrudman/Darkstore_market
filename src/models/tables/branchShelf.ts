import { SHA256 } from "crypto-js";
import { Pool } from "pg";

export class BranchShelfTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async hasQR(qr: string) {
        return (await this.db.query('SELECT 1 FROM branch_shelfs WHERE qr = $1', [
            qr
        ])).rowCount > 0;
    }

    async create(branch_id: number, name: string, storage_type_id: number, qr: string, created_by_id: number) {
        await this.db.query('INSERT INTO branch_shelfs VALUES(default, $1, $2, $3, true, $4, default, $5)', [
            branch_id,
            name,
            storage_type_id,
            SHA256(qr).toString(),
            created_by_id
        ]);
    }
}
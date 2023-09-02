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

    async getList(branch_id: number, page: number) {
        return (await this.db.query('SELECT id, name, (SELECT name FROM storage_type WHERE id = storage_type_id) as storage_type, is_disabled FROM branch_shelfs WHERE branch_id = $1 ORDER BY name ASC LIMIT 15 OFFSET $2', [
            branch_id,
            page * 15
        ])).rows;
    }

    async getById(id: number) {
        return (await this.db.query('SELECT id, branch_id, name, (SELECT name FROM storage_type WHERE id = storage_type_id) as storage_type, is_disabled FROM branch_shelfs WHERE id = $1', [
            id
        ])).rows[0];
    }

    async create(branch_id: number, name: string, storage_type_id: number, qr: string, created_by_id: number) {
        await this.db.query('INSERT INTO branch_shelfs VALUES(default, $1, $2, $3, false, $4, default, $5)', [
            branch_id,
            name,
            storage_type_id,
            SHA256(qr).toString(),
            created_by_id
        ]);
    }
}
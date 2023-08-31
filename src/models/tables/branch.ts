import { Pool } from "pg";
import { SHA256 } from "crypto-js";

export class BranchTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async hasId(id: number) {
        return (await this.db.query('SELECT 1 FROM branch WHERE id = $1', [
            id
        ])).rowCount > 0;
    }

    async hasQR(qr: string) {
        return (await this.db.query('SELECT 1 FROM branch WHERE qr = $1', [
            qr
        ])).rowCount > 0;
    }

    async getList(page: number, only_name?: boolean) {
        if (only_name) {
            return (await this.db.query('SELECT name FROM branch LIMIT 15 OFFSET $1', [
                page * 15
            ])).rows;
        }

        return (await this.db.query('SELECT id, name, address, timezone, phone_number, status FROM branch LIMIT 15 OFFSET $1', [
            page * 15
        ])).rows;
    }

    async getById(id: number) {
        return (await this.db.query('SELECT * FROM branch WHERE id = $1', [
            id
        ])).rows[0];
    }

    async create(name: string, address: string, timezone: string, phone_number: string, qr: string, created_by_id: number) {
        return (await this.db.query('INSERT INTO branch VALUES(default, $1, $2, $3, $4, 0, $5, default, $6) RETURNING id', [
            name,
            address,
            timezone,
            phone_number,
            SHA256(qr).toString(),
            created_by_id
        ])).rows[0].id;
    }
}
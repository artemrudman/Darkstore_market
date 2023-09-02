import { SHA256 } from "crypto-js";
import { Pool } from "pg";

export class WorkerTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async hasQR(qr: string) {
        return (await this.db.query('SELECT 1 FROM worker WHERE qr = $1', [
            qr
        ])).rowCount > 0;
    }

    async getList(branch_id: number, page: number, role_id?: number) {
        if (role_id) {
            return (await this.db.query('SELECT id, branch_id, name, role_id, status, is_disabled FROM worker WHERE branch_id = $1 AND role_id = $2 LIMIT 15 OFFSET $3', [
                branch_id,
                role_id,
                page * 15
            ])).rows;
        }

        return (await this.db.query('SELECT id, branch_id, name, role_id, status, is_disabled FROM worker WHERE branch_id = $1 LIMIT 15 OFFSET $2', [
            branch_id,
            page * 15
        ])).rows;
    }

    async getById(id: number) {
        return (await this.db.query('SELECT * FROM worker WHERE id = $1', [id])).rows[0];
    }

    async getByEmail(email: string) {
        return (await this.db.query('SELECT * FROM worker WHERE email = $1', [email])).rows[0];
    }

    async create(branch_id: number, name: string, email: string, phone_number: string, role_id: number, qr: string, created_by_id: number) {
        await this.db.query('INSERT INTO worker VALUES(default, $1, $2, $3, $4, $5, 0, false, $6, default, $7)', [
            branch_id,
            name,
            email,
            phone_number,
            role_id,
            SHA256(qr).toString(),
            created_by_id
        ]);
    }
}
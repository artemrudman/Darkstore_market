import { PoolClient } from 'pg';
import { SHA256 } from 'crypto-js';

export class BranchTable {
    private client: PoolClient;
    constructor(client: PoolClient) {
        this.client = client;
    }

    async hasId(id: number) {
        return (await this.client.query('SELECT 1 FROM branch WHERE id = $1', [
            id
        ])).rowCount > 0;
    }

    async hasQR(qr: string) {
        return (await this.client.query('SELECT 1 FROM branch WHERE qr = $1', [
            qr
        ])).rowCount > 0;
    }

    async getList(page: number, only_name?: boolean) {
        if (only_name) {
            return (await this.client.query('SELECT name FROM branch LIMIT 15 OFFSET $1', [
                page * 15
            ])).rows;
        }

        return (await this.client.query('SELECT id, name, address, timezone, phone_number, status FROM branch LIMIT 15 OFFSET $1', [
            page * 15
        ])).rows;
    }

    async getById(id: number) {
        return (await this.client.query('SELECT * FROM branch WHERE id = $1', [
            id
        ])).rows[0];
    }

    async create(name: string, address: string, timezone: string, phone_number: string, qr: string, created_by_id: number) {
        return (await this.client.query('INSERT INTO branch VALUES(default, $1, $2, $3, $4, 0, $5, default, $6) RETURNING id', [
            name,
            address,
            timezone,
            phone_number,
            SHA256(qr).toString(),
            created_by_id
        ])).rows[0].id;
    }

    async updateStatus(id: number, status: number) {
        await this.client.query('UPDATE branch SET status = $1 WHERE id = $2', [
            id,
            status
        ]);
    }
}
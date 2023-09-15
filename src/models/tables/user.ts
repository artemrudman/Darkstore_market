import { PoolClient } from 'pg';

export class UserTable {
    private client: PoolClient;
    constructor(client: PoolClient) {
        this.client = client;
    }

    async getById(id: number) {
        return (await this.client.query('SELECT * FROM user_ WHERE id = $1', [id])).rows[0];
    }
}
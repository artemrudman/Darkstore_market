import { PoolClient } from 'pg';

export class ProductTypeTable {
    private client: PoolClient;
    constructor(client: PoolClient) {
        this.client = client;
    }

    async hasId(id: number) {
        return (await this.client.query('SELECT 1 FROM product_type WHERE id = $1', [
            id
        ])).rowCount > 0;
    }

    async create(name: string, created_by_id: number) {
        await this.client.query('INSERT INTO product_type VALUES(default, $1, default, $2)', [
            name,
            created_by_id
        ]);
    }
}
import { PoolClient } from 'pg';
import { SHA256 } from 'crypto-js';

export class ItemTable {
    private client: PoolClient;
    constructor(client: PoolClient) {
        this.client = client;
    }

    async hasBarcode(barcode: string) {
        return (await this.client.query('SELECT 1 FROM item WHERE barcode = $1', [
            SHA256(barcode).toString(),
        ])).rowCount > 0;
    }

    async getById(id: number) {
        return (await this.client.query('SELECT * FROM item WHERE id = $1', [
            id
        ])).rows[0];
    }

    async create(name: string, description: string, ingredients: string, weight: number, product_type_id: number,
        storage_type_id: number, picture_uuid: string, barcode: string, created_by_id: number) {
        await this.client.query('INSERT INTO item VALUES(default, $1, $2, $3, $4, $5, $6, $7, $8, default, $9)', [
            name,
            description,
            ingredients,
            weight,
            product_type_id,
            storage_type_id,
            picture_uuid,
            SHA256(barcode).toString(),
            created_by_id
        ]);
    }
}
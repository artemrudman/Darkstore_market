import { Pool } from "pg";

export class ProductTypeTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async hasId(id: number) {
        return (await this.db.query('SELECT 1 FROM product_type WHERE id = $1', [
            id
        ])).rowCount > 0;
    }

    async create(name: string, created_by_id: number) {
        await this.db.query('INSERT INTO product_type VALUES(default, $1, default, $2)', [
            name,
            created_by_id
        ]);
    }
}
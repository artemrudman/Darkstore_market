import { Pool } from "pg";

export class ProductTypeTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async create(name: string, created_by_id: number) {
        await this.db.query('INSERT INTO product_type VALUES(default, $1, default, $2)', [
            name,
            created_by_id
        ]);
    }
}
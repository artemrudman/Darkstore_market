import { Pool } from "pg";

export class UserTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async getById(id: number) {
        return (await this.db.query('SELECT * FROM user_ WHERE id = $1', [id])).rows[0];
    }
}
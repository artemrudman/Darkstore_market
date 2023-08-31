import { Pool } from "pg";
import format from "pg-format";

export class BranchScheduleTable {
    private db: Pool;
    constructor(db: Pool) {
        this.db = db;
    }

    async get(branch_id: number): Promise<Array<string> | undefined> {
        let schedule = ['1'];

/*             if (day.status === 0) {
                schedule.push(`${day.start_time.split(':').slice(0, 2).join(':')}-${day.end_time.split(':').slice(0, 2).join(':')}`);
            } else if (day.status === 1) {
                schedule.push('Closed');
            } */


        for (const day of (await this.db.query('SELECT status, start_time, end_time FROM branch_schedule WHERE branch_id = $1 ORDER BY day DESC', [
            branch_id
        ])).rows) {
            console.log(day);
        }

        return schedule;
    }

    async create(branch_id: number, schedule: string[]) {
        const rows = [];
        let i = 0;
    
        for (const day of schedule) {
            if (day === 'Closed') {
                rows.push([branch_id, day === 'Closed' ? 1 : 0, i++, '00:00', '00:00']);
            } else {
                const parts = day.split('-');

                rows.push([branch_id, day === 'Closed' ? 1 : 0, i++, parts[0], parts[1]]);
            }
        }
        
        await this.db.query(format('INSERT INTO branch_schedule VALUES %L', rows));
    }
}
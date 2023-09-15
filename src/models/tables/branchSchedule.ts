import { PoolClient } from 'pg';
import format from 'pg-format';

export class BranchScheduleTable {
    private client: PoolClient;
    constructor(client: PoolClient) {
        this.client = client;
    }

    async get(branch_id: number): Promise<Array<string> | undefined> {
        let schedule = [];

        for (const day of (await this.client.query('SELECT status, start_time, end_time FROM branch_schedule WHERE branch_id = $1 ORDER BY day ASC', [
            branch_id
        ])).rows) {
            if (day.status === 0) {
                schedule.push(`${day.start_time.split(':').slice(0, 2).join(':')}-${day.end_time.split(':').slice(0, 2).join(':')}`);
            } else if (day.status === 1) {
                schedule.push('Closed');
            }
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
        
        await this.client.query(format('INSERT INTO branch_schedule VALUES %L', rows));
    }
}
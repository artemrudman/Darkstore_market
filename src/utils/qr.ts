import { WorkerTable } from '../models/tables/worker';
import { BranchTable } from '../models/tables/branch';
import { BranchShelfTable } from '../models/tables/branchShelf';

function generateData() {
    const chars = '!#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let result = '';

    for (let i = 0; i < 64; ++i) {
        result += chars[Math.floor(Math.random() * 93)];
    }

    return result;
}

export async function generateQr(table: WorkerTable | BranchTable | BranchShelfTable) {
    let qr;

    for (let i = 0; i < 3; ++i) {
        qr = generateData();

        if (!(await table.hasQR(qr))) {
            return qr;
        }
    }

    return null;
} 
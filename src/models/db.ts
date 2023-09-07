import { Pool } from "pg";
import { ProductTypeTable } from "./tables/productType";
import { StorageTypeTable } from "./tables/storageType";
import { WorkerTable } from "./tables/worker";
import { BranchTable } from "./tables/branch";
import { BranchScheduleTable } from "./tables/branchSchedule";
import { BranchShelfTable } from "./tables/branchShelf";
import { UserTable } from "./tables/user";
import { ItemTable } from "./tables/item";

export class DB {
    public productType: ProductTypeTable;
    public storageType: StorageTypeTable;
    public worker: WorkerTable;
    public branch: BranchTable;
    public branchSchedule: BranchScheduleTable;
    public branchShelf: BranchShelfTable;
    public item: ItemTable;
    public user: UserTable;
    constructor() {
        const db = new Pool({ connectionString: process.env.POSTGRES_URL });
        
        this.productType = new ProductTypeTable(db);
        this.storageType = new StorageTypeTable(db);
        this.worker = new WorkerTable(db);
        this.branch = new BranchTable(db);
        this.branchSchedule = new BranchScheduleTable(db);
        this.branchShelf = new BranchShelfTable(db);
        this.item = new ItemTable(db);
        this.user = new UserTable(db);
    }
}
export type Order = {
    id: number;
    branch_id: number;
    number: string;
    items: object;
    status: number;
    user_id: number;
    delivery_address: string;
    worker_id: number;
    worker_start_time: number;
    worker_end_time: number;
    deliveryman_id: number;
    deliveryman_start_time: number;
    deliveryman_end_time: number;
    created_date: number;
};
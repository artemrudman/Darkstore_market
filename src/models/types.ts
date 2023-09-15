import { Pool } from 'pg';
import { RedisClientType } from 'redis';

export type Acceptance = {
    id: number;
    branch_id: number;
    items: object;
    is_finished: boolean;
    created_date: number;
    created_by_id: number;
};

export type Branch = {
    id: number;
    name: string;
    address: string;
    timezone: string;
    phone_number: string;
    status: number;
    qr: string;
    created_date: number;
    created_by_id: number;
};

export type BranchItem = {
    id: number;
    branch_id: number;
    name: string;
    description: string;
    ingredients: string;
    weight: number;
    product_type_id: number;
    storage_type_id: number;
    items: object;
    expires_date: number;
    is_sale: boolean;
    price: number;
    sale_price: number;
    picture_uuid: string;
    barcode: string;
    created_date: number;
    created_by_id: number;
};

export type BranchShelf = {
    id: number;
    branch_id: number;
    name: string;
    storage_type_id: number;
    is_disabled: boolean;
    qr: string;
    created_date: number;
    created_by_id: number;
};

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

export type ProductType = {
    id: number;
    name: string;
    created_date: number;
    created_by_id: number;
};

export type StorageType = {
    id: number;
    name: string;
    created_date: number;
    created_by_id: number;
};

export type User = {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    password: string;
    payment_info: object;
    registration_date: number;
    is_disabled: boolean;
};

export type Worker = {
    id: number;
    branch_id: number;
    name: string;
    email: string;
    phone_number: string;
    role_id: number;
    status: number;
    is_disabled: boolean;
    qr: string;
    created_date: number;
    created_by_id: number;
};

export type Vars = {
    db: Pool;
    redis: RedisClientType;
};
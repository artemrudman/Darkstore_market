export type Worker = {
    id: number;
    branch_id: number;
    name: string;
    email: string;
    phone_number: string;
    barcode: number;
    role_id: number;
    status: number;
    sale_promocode: object;
    is_disabled: boolean;
    created_date: number;
    created_by_id: number;
};
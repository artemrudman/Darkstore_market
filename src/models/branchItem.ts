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
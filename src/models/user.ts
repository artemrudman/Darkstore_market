export type User = {
    id: number;
    name: string;
    password: string;
    email: string;
    phone_number: string;
    sale_promocode: object;
    payment_info: object;
    registration_date: number;
    is_disabled: boolean;
};
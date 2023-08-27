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
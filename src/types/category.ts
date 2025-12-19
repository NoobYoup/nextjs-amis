export interface Category {
    id: string;
    name: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string;
}

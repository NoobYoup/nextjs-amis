export interface Activity {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    date: string;
    author: string;
    thumbnail: string;
    images: string[];
    videos?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ActivityFormData {
    title: string;
    description: string;
    category: string;
    date: string;
    author: string;
    thumbnail: File | string;
    images: (File | string)[];
    videos?: string[];
}

export interface ActivityResponse {
    success: boolean;
    data?: Activity;
    message?: string;
}

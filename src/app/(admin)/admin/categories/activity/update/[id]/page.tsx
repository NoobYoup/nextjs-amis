import { api } from '@/lib/api';
import CategoryUpdateClient from './CategoryUpdateClient';

export async function generateStaticParams() {
    try {
        const data = await api.get<any[]>('/admin/categories/activity');
        return data.map((category) => ({
            id: category.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin activity categories:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateCategoryPage({ params }: Props) {
    const { id } = await params;
    
    return <CategoryUpdateClient id={id} />;
}

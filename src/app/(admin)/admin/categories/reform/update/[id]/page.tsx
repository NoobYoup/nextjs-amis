import { api } from '@/lib/api';
import ReformCategoryUpdateClient from './ReformCategoryUpdateClient';

export async function generateStaticParams() {
    try {
        const data = await api.get<any[]>('/admin/categories/reform');
        return data.map((category) => ({ id: category.id.toString() }));
    } catch (error) {
        console.error('Error in generateStaticParams for reform categories:', error);
        return [];
    }
}

type Props = { params: Promise<{ id: string }> };

export default async function UpdateReformCategoryPage({ params }: Props) {
    const { id } = await params;
    return <ReformCategoryUpdateClient id={id} />;
}

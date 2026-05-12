import { api } from '@/lib/api';
import ProcedureCategoryUpdateClient from './ProcedureCategoryUpdateClient';

export async function generateStaticParams() {
    try {
        const data = await api.get<any[]>('/admin/categories/procedure');
        return data.map((category) => ({ id: category.id.toString() }));
    } catch (error) {
        console.error('Error in generateStaticParams for procedure categories:', error);
        return [];
    }
}

type Props = { params: Promise<{ id: string }> };

export default async function UpdateProcedureCategoryPage({ params }: Props) {
    const { id } = await params;
    return <ProcedureCategoryUpdateClient id={id} />;
}

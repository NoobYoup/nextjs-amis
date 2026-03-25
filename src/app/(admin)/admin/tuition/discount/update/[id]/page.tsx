import { api } from '@/lib/api';
import DiscountUpdateClient from './DiscountUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/admin/tuition?type=discount');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin tuition discount:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateTuitionDiscountPage({ params }: Props) {
    const { id } = await params;
    
    return <DiscountUpdateClient id={id} />;
}

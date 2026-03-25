import { api } from '@/lib/api';
import FeeUpdateClient from './FeeUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/admin/tuition?type=fee');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin tuition fee:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateTuitionFeePage({ params }: Props) {
    const { id } = await params;
    
    return <FeeUpdateClient id={id} />;
}

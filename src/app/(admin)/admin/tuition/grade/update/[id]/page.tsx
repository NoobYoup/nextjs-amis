import { api } from '@/lib/api';
import GradeUpdateClient from './GradeUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/admin/tuition?type=grade');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin tuition grade:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateTuitionGradePage({ params }: Props) {
    const { id } = await params;
    
    return <GradeUpdateClient id={id} />;
}

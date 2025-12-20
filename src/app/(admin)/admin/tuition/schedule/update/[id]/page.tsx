import { api } from '@/lib/api';
import ScheduleUpdateClient from './ScheduleUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/admin/tuition?type=schedule');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin tuition schedule:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateTuitionSchedulePage({ params }: Props) {
    const { id } = await params;
    
    return <ScheduleUpdateClient id={id} />;
}

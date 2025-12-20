import { api } from '@/lib/api';
import ActivityDetailClient from './ActivityDetailClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/activities');
        return data.map((activity) => ({
            id: activity.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for activities:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ActivityDetailPage({ params }: Props) {
    const { id } = await params;
    
    return <ActivityDetailClient id={id} />;
}

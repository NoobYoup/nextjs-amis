import { api } from '@/lib/api';
import ActivityUpdateClient from './ActivityUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/activities');
        return data.map((activity) => ({
            id: activity.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin activities:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateActivityPage({ params }: Props) {
    const { id } = await params;
    
    return <ActivityUpdateClient id={id} />;
}

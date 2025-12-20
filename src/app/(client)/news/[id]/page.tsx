import { api } from '@/lib/api';
import NewsDetailClient from './NewsDetailClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/news');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for news:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function NewsDetailPage({ params }: Props) {
    const { id } = await params;
    
    return <NewsDetailClient id={id} />;
}

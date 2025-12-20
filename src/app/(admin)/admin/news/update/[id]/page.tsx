import { api } from '@/lib/api';
import NewsUpdateClient from './NewsUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/news');
        return data.map((item) => ({
            id: item.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin news:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateNewsPage({ params }: Props) {
    const { id } = await params;
    
    return <NewsUpdateClient id={id} />;
}

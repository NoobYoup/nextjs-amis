import { api } from '@/lib/api';
import ReformUpdateClient from './ReformUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/reforms');
        return data.map((reform) => ({
            id: reform.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin reforms:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateReformPage({ params }: Props) {
    const { id } = await params;
    
    return <ReformUpdateClient id={id} />;
}

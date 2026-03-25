import { api } from '@/lib/api';
import DocumentUpdateClient from './DocumentUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/documents');
        return data.map((doc) => ({
            id: doc.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin documents:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateDocumentPage({ params }: Props) {
    const { id } = await params;
    
    return <DocumentUpdateClient id={id} />;
}

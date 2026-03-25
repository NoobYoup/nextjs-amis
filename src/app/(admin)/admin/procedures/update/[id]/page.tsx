import { api } from '@/lib/api';
import ProcedureUpdateClient from './ProcedureUpdateClient';

export async function generateStaticParams() {
    try {
        const { data } = await api.get<{ data: any[] }>('/client/procedures');
        return data.map((procedure) => ({
            id: procedure.id.toString(),
        }));
    } catch (error) {
        console.error('Error in generateStaticParams for admin procedures:', error);
        return [];
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function UpdateProcedurePage({ params }: Props) {
    const { id } = await params;
    
    return <ProcedureUpdateClient id={id} />;
}

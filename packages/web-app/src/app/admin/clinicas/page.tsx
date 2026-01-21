/**
 * ⚙️ IMPL REFERENCE: IMPL-20260121-01
 * 📄 SEE: context/SPEC-MVP-DEMO-APIS.md
 * 🤖 AUTHOR: SOFIA (Claude Opus 4.5)
 * 
 * Página de Gestión de Clínicas
 * Server Component que carga datos desde API real
 */

import { ClinicsClientPage } from './ClientPage';

export const metadata = {
  title: 'Clínicas | AMI-SYSTEM',
  description: 'Gestión de clínicas, horarios y médicos',
};

export const dynamic = 'force-dynamic';

/**
 * Server-side data fetching from real API
 */
async function getClinics() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/clinicas?pageSize=100`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch clinics:', response.status);
      return { data: [], total: 0, page: 1, pageSize: 10, hasMore: false };
    }
    
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      pageSize: data.pagination?.pageSize || 10,
      hasMore: data.pagination?.page < data.pagination?.totalPages,
    };
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return { data: [], total: 0, page: 1, pageSize: 10, hasMore: false };
  }
}

export default async function ClinicsPage() {
  const clinics = await getClinics();

  return (
    <ClinicsClientPage
      clinics={clinics.data}
      total={clinics.total}
      page={clinics.page}
      pageSize={clinics.pageSize}
    />
  );
}

/**
 * /admin/clinicas
 * Server Component that displays the clinics management page with doctor modal
 */

import { ClinicsClientPage } from './ClientPage';

export const metadata = {
  title: 'Clinics | AMI-SYSTEM',
  description: 'Manage clinics, schedules and doctors',
};

/**
 * Mock data provider (replace with real ClinicService when DB is ready)
 */
async function getClinics() {
  return {
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false
  };
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

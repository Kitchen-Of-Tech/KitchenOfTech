import { CertificateManagementClient } from '@/components/dashboard/CertificateManagementClient';

export const metadata = {
  title: 'Certificate Management | Dashboard',
  description: 'Manage course completion certificates',
};

export default function CertificatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <CertificateManagementClient />
      </div>
    </div>
  );
}

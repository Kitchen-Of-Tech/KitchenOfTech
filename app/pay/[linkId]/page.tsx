import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import PublicPaymentClient from '@/components/payment/PublicPaymentClient';

interface PageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function PaymentLinkPage({ params }: PageProps) {
  const { linkId } = await params;
  const supabase = await createAdminClient();

  // Fetch payment link details
  const { data: link, error: linkError } = await supabase
    .from('payment_links')
    .select('*')
    .eq('link_id', linkId)
    .single();

  if (linkError || !link) {
    console.error('Payment link not found:', linkError);
    notFound();
  }

  // Check if link is valid
  const now = new Date();
  const isExpired = link.expiry_date && new Date(link.expiry_date) < now;
  const isMaxUsesReached = link.max_uses && link.current_uses >= link.max_uses;
  
  if (link.status !== 'active' || isExpired || isMaxUsesReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass rounded-xl border border-white/10 p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Link Unavailable</h1>
          <p className="text-white/60">
            {isExpired && 'This payment link has expired.'}
            {isMaxUsesReached && 'This payment link has reached its maximum uses.'}
            {link.status === 'cancelled' && 'This payment link has been cancelled.'}
            {link.status === 'completed' && 'This payment link has been completed.'}
          </p>
        </div>
      </div>
    );
  }

  // Fetch active payment methods
  const { data: paymentMethods, error: methodsError } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (methodsError) {
    console.error('Failed to fetch payment methods:', methodsError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-12 px-4">
      <PublicPaymentClient 
        link={link} 
        paymentMethods={paymentMethods || []} 
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { linkId } = await params;
  const supabase = await createAdminClient();

  const { data: link } = await supabase
    .from('payment_links')
    .select('title, description')
    .eq('link_id', linkId)
    .single();

  return {
    title: link?.title ? `${link.title} - Payment` : 'Payment',
    description: link?.description || 'Complete your payment',
  };
}

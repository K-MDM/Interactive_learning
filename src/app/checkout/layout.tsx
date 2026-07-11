import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Virtual Simulator Lab Membership Plans | Keeelai',
  description: 'Unlock full access to Keeelai interactive simulator labs. Choose month, bi-annual, or annual plan memberships for schools and homes.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

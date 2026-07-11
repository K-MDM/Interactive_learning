import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get in Touch with Keeelai Education Support',
  description: 'Have questions about setting up simulation player widgets across science, history, geography, and grammar? Contact our education support team.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

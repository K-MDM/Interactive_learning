import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In or Register your Keeelai Classroom Account',
  description: 'Log into your Keeelai simulation portal or create a new teacher/student account to save active learning progress and customized simulations.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium K-12 Virtual Simulator Membership Plans | Keeelai',
  description: 'Unlock full access to Keeelai interactive simulator modules. Choose monthly, bi-annual, or annual plans for schools and home studies.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Keeelai Premium Simulator Access",
            "description": "Unlock full access to Keeelai's interactive virtual science experiments and classroom visualizers.",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "4.99",
              "highPrice": "49.99",
              "offerCount": "3"
            }
          })
        }}
      />
      {children}
    </>
  );
}

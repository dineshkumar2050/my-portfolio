import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dinesh Kumar | Software Engineer & Tech Lead',
  description:
    'Full-stack Software Engineer and Tech Lead with 8+ years building scalable applications across fintech, institutional banking, education, and e-commerce. Expert in React, Next.js, Node.js, NestJS, TypeScript, AWS, Kafka, and Temporal.',
  keywords: [
    'Dinesh Kumar',
    'Software Engineer',
    'Tech Lead',
    'MERN Stack',
    'React',
    'Next.js',
    'Node.js',
    'NestJS',
    'TypeScript',
    'AWS',
    'Microservices',
    'Full Stack Developer',
  ],
  authors: [{ name: 'Dinesh Kumar' }],
  openGraph: {
    title: 'Dinesh Kumar | Software Engineer & Tech Lead',
    description: 'Full-stack engineer with 8+ years building production-grade applications.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

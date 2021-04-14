import Head from 'next/head';
import { Footer } from './footer';

export type Props = {
  title: string,
  children: React.ReactNode
};

export const Layout = (props: Props): React.ReactElement => {
  const { title, children } = props;

  return (
    <div className="min-h-screen px-4 lg:px-2 flex flex-col justify-center items-center">
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20 flex flex-1 flex-col justify-center items-center">
        {children}
      </main>

      <Footer />
    </div>
  );
};

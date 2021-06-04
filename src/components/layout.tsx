import clsx from 'clsx';
import Head from 'next/head';
import { Footer } from './footer';

export type Props = {
  title: string,
  padding?: boolean,
  children: React.ReactNode
};

export const Layout = (props: Props): React.ReactElement => {
  const { title, padding = true, children } = props;

  return (
    <div className={clsx("min-h-screen flex flex-col justify-center items-center", padding && "px-4 lg:px-2")}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={clsx(padding && "py-20", "flex flex-1 flex-col justify-center items-center")}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

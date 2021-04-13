import type { AppProps } from 'next/app';
import '../css/base.css';

const MyApp = ({ Component, pageProps }: AppProps): React.ReactElement | null => {
  return <Component {...pageProps} />;
};

export default MyApp;

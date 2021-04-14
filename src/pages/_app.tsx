import /* App, */ { AppProps, /* AppContext, AppInitialProps */ } from 'next/app';
import { init } from '../utils/sentry';
import '../css/base.css';

// Initialize Sentry error logging
init();

export type Props = AppProps & { err: unknown };

const MyApp = ({ Component, pageProps, err }: Props): React.ReactElement => {
  // Workaround for https://github.com/vercel/next.js/issues/8592
  return <Component {...pageProps} err={err} />;
};

// MyApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {
//   const appProps = await App.getInitialProps(context);
//   return { ...appProps };
// };

export default MyApp;

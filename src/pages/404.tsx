import Link from 'next/link';
import { useState } from 'react';
import { Layout } from '../components/layout';

const drawings = [
  "/undraw_empty_xct9.svg",
  "/undraw_not_found_60pq.svg",
  "/undraw_page_not_found_su7k.svg",
  "/undraw_void_3ggu.svg",
];

const getRandomArbitrary = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const NotFound = (): React.ReactElement => {
  const [drawing] = useState(drawings[getRandomArbitrary(0, drawings.length)]);

  return (
    <Layout title="¿Estás seguro que esta página existe?">
      <img className="w-full h-80" src={drawing} alt="" />

      <h1 className="mt-8 text-3xl font-semibold">
        ¡Uh-oh!
      </h1>

      <p className="mt-4 w-full max-w-3xl text-center text-gray-700">
        ¿Estás seguro que esta página existe? Porque nosotros no la hemos encontrado.
      </p>

      <div className="w-full sm:w-48 mt-12">
        <Link href="/" passHref>
          <a className="block w-full text-white text-center bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4 py-2 px-3 rounded-md transition">
            Volver al inicio  
          </a>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;

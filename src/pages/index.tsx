import clsx from 'clsx';
import Head from 'next/head';
import { useForm, useFieldArray } from 'react-hook-form';
import { StudentField } from '../components/student-field';
import { GroupFormValues } from '../utils/groups';

const MAX_GROUP_COUNT = Number(process.env.NEXT_PUBLIC_MAX_GROUP_COUNT);

const Home = (): React.ReactElement => {
  const { control, register, handleSubmit, reset, setError, clearErrors } = useForm<GroupFormValues>({
    defaultValues: {
      students: [{
        value: '',
      }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const canRemove = fields.length > 1;
  const canAppend = fields.length < MAX_GROUP_COUNT;
  const handleAppend = () => {
    if (canAppend) append({ value: '' });
  };
  const handleRemove = () => {
    if (canRemove) remove(fields.length - 1);
  };

  const onSubmit = async (data: GroupFormValues) => {
    const body = { students: data.students.map(item => item.value) };
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      console.log(json);
      reset({ students: [{ value: '' }] });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen px-4 lg:px-2 flex flex-col justify-center items-center">
      <Head>
        <title>Creación de Grupos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20 flex flex-1 flex-col justify-center items-center">
        <h1 className="text-5xl md:text-7xl font-medium text-center">
          Registro de Grupos
        </h1>

        <p className="mt-4 w-full max-w-3xl text-center text-gray-700">
          Aquí podrás inscribir tu grupo para el Trabajo Parcial del curso de Algoritmos y Estructuras de Datos. Ten
          en cuenta que <span className="font-semibold">solo podrás inscribir a una persona si es que esta aun no tiene un grupo asignado</span>.
        </p>

        <form className="grid grid-cols-2 gap-4 w-full max-w-4xl mt-12" onSubmit={handleSubmit(onSubmit)} noValidate>
          {fields.map((field, index) =>
            <StudentField
              key={field.id}
              control={control}
              field={field}
              index={index}
              register={register}
              setError={setError}
              clearErrors={clearErrors}
            />)
          }
          <div>
            <button
              type="button"
              className={clsx("w-full text-white py-2 px-3 rounded-md transition", canRemove ? "bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4" : "bg-indigo-400")}
              disabled={!canRemove}
              onClick={handleRemove}
            >
              Eliminar
            </button>
          </div>
          <div>
            <button
              type="button"
              className={clsx("w-full text-white py-2 px-3 rounded-md transition", canAppend ? "bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4" : "bg-indigo-400")}
              disabled={!canAppend}
              onClick={handleAppend}
            >
              Añadir
            </button>
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full text-white bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4 py-2 px-3 rounded-md transition"
            >
              Enviar
            </button>
          </div>
        </form>
      </main>

      <footer className="w-full h-24 border-t border-solid border-gray-200 flex flex-col justify-center items-center">
        <a
          href="https://github.com/dalbitresb12"
          className="flex justify-center items-center mb-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Diseñado por Diego Albitres{' '}
          <img src="/github.svg" alt="GitHub Logo" className="ml-2 h-6" />
        </a>
        <a
          href="https://vercel.com/"
          className="flex justify-center items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hosteado por {' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="ml-2 h-4" />
        </a>
      </footer>
    </div>
  );
};

export default Home;

import clsx from 'clsx';
import { useForm, useFieldArray } from 'react-hook-form';
import { UserRemoveIcon, UserAddIcon, UploadIcon } from '@heroicons/react/outline';
import { ReactSwal } from '../components/alert';
import { Layout } from '../components/layout';
import { StudentField } from '../components/student-field';
import { GroupAPI, GroupFormValues } from '../utils/groups';

const MIN_GROUP_COUNT = Number(process.env.NEXT_PUBLIC_MIN_GROUP_COUNT);
const MAX_GROUP_COUNT = Number(process.env.NEXT_PUBLIC_MAX_GROUP_COUNT);

const Home = (): React.ReactElement => {
  const { control, register, handleSubmit, reset, trigger } = useForm<GroupFormValues>({
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
  const canAppend = Number.isNaN(MAX_GROUP_COUNT) ? true : fields.length < MAX_GROUP_COUNT;
  const canSend = fields.length >= MIN_GROUP_COUNT && fields.length <= MAX_GROUP_COUNT;
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

      const json = (await res.json()) as GroupAPI;
      if (json.status === "ok") {
        const quantity = json.group["Número de integrantes"];
        const quantityStr = quantity === 1 ? `${quantity.toString()} integrante` : `${quantity.toString()} integrantes`;
        const groupNum = json.group["Grupo"].toString();
        // Inform the user the group was saved successfully
        ReactSwal.fire({
          icon: 'success',
          title: <span className="text-2xl font-bold tracking-wide">¡Listo!</span>,
          html: (
            <p className="text-gray-700">
              Tu grupo ha sido registrado satisfactoriamente con {quantityStr} como el{' '}
              <span className="font-semibold">Grupo {groupNum}</span>.
            </p>
          ),
        });
        // Reset the form
        reset({ students: [{ value: '' }] });
      } else {
        // Inform the user something went wrong
        ReactSwal.fire({
          icon: 'error',
          title: <span className="text-2xl font-bold tracking-wide">¡Uh-oh!</span>,
          html: (
            <>
              <p className="text-gray-700">
                Ha sucedido un problema inesperado al intentar registrar tu grupo. Inténtalo
                de nuevo más tarde o comunícate con el administrador.
              </p>
              {json.eventId &&
                <p className="text-xs text-gray-700 mt-2">
                  En caso contactes al administrador, puedes darle el siguiente código de error: {json.eventId}
                </p>
              }
            </>
          ),
        });
      }
    } catch (err) {
      // Inform the user something went wrong
      ReactSwal.fire({
        icon: 'error',
        title: <span className="text-2xl font-bold tracking-wide">¡Uh-oh!</span>,
        html: (
          <p className="text-gray-700">
            Ha sucedido un problema inesperado al intentar registrar tu grupo. Inténtalo
            de nuevo más tarde o comunícate con el administrador.
          </p>
        ),
      });
    }
  };

  return (
    <Layout title="Inscripción de Grupos">
      <h1 className="text-5xl md:text-7xl font-medium text-center">
        Registro de Grupos
      </h1>

      <p className="mt-4 w-full max-w-3xl text-center text-gray-700">
        Aquí podrás inscribir tu grupo para el Trabajo Final del curso de Aplicaciones para Dispositivos Móviles. Ten
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
            trigger={trigger}
          />)
        }
        <div>
          <button
            type="button"
            className={clsx("w-full flex items-center justify-center text-white py-2 px-3 rounded-md transition", canRemove ? "bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4" : "bg-indigo-400")}
            disabled={!canRemove}
            onClick={handleRemove}
          >
            <UserRemoveIcon className="w-6 h-6 mr-2" />
            <span>
              Eliminar
            </span>
          </button>
        </div>
        <div>
          <button
            type="button"
            className={clsx("w-full flex items-center justify-center text-white py-2 px-3 rounded-md transition", canAppend ? "bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4" : "bg-indigo-400")}
            disabled={!canAppend}
            onClick={handleAppend}
          >
            <UserAddIcon className="w-6 h-6 mr-2" />
            <span>
              Añadir
            </span>
          </button>
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className={clsx("w-full flex items-center justify-center text-white py-2 px-3 rounded-md transition", canSend ? "bg-indigo-800 focus:bg-indigo-700 hover:bg-indigo-700 focus:ring-4" : "bg-indigo-400")}
            disabled={!canSend}
          >
            <UploadIcon className="w-6 h-6 mr-2" />
            <span>
              Enviar
            </span>
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Home;

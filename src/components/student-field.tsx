import { useMemo, useState } from 'react';
import { FieldArrayWithId, Control, UseFormRegister, useFormState, useWatch, UseFormTrigger } from 'react-hook-form';
import { Input } from './input';
import { GroupFormValues } from '../utils/groups';
import { isEqualStudentId, isValidStudent, Student, StudentAPI } from '../utils/students';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import clsx from 'clsx';

export type Props = {
  field: FieldArrayWithId<GroupFormValues, "students">,
  index: number,
  control: Control<GroupFormValues>,
  register: UseFormRegister<GroupFormValues>,
  trigger: UseFormTrigger<GroupFormValues>,
};

export const StudentField = (props: Props): React.ReactElement => {
  const { field, index, control, register, trigger } = props;
  const { errors } = useFormState({ control });
  const [studentInfo, setStudentInfo] = useState<Student>();
  const fieldArrayValues = useWatch({
    control,
    name: "students",
    defaultValue: [],
  });
  const fieldName = `students.${index}.value` as const;
  const fieldErrors = errors.students ? errors.students[index] : undefined;
  const fieldRegistration = useMemo(() => register(fieldName, {
    required: {
      message: 'Este campo es obligatorio',
      value: true,
    },
    pattern: {
      message: 'No es un ID válido',
      value: /^[uU]?[^uU]{1}[a-zA-Z0-9]{8}$/,
    },
    validate: {
      noDuplicates: (value: string) => {
        const count = fieldArrayValues.reduce<number>((acc, item) => {
          const found = isEqualStudentId(item.value, value);
          if (found) acc += 1;
          return acc;
        }, 0);
        if (count > 1) {
          return "No pueden existir entradas duplicadas.";
        }
      },
      validStudentId: (value: string) => {
        const currentValue = studentInfo && studentInfo["Código"] || "";
        if (!isEqualStudentId(value, currentValue)) {
          return "No se ha encontrado ningún estudiante con ese código.";
        }
      }
    }
  }), [fieldArrayValues, fieldName, register, studentInfo]);

  const handleFetchStudent = async (student: string): Promise<StudentAPI> => {
    const res = await fetch(`/api/students/${student}`);
    const body = await res.json();
    return body as StudentAPI;
  };

  useDebouncedEffect(() => {
    const currentValue = fieldArrayValues[index]?.value || "";
    // If this is true, then we should set studentInfo to undefined in case of an error
    const synced = studentInfo && isEqualStudentId(studentInfo["Código"], currentValue);
    // Ignore this re-render if the data is already in sync
    if (synced && studentInfo !== undefined) return;
    if (currentValue) {
      // If the value is not a valid student id, ignore this re-render
      if (!isValidStudent(currentValue)) {
        setStudentInfo(undefined);
        // Always trigger revalidation of this field
        trigger(fieldName);
        return;
      }
      // Try to fetch the new student
      handleFetchStudent(currentValue)
        .then(data => {
          if ('error' in data) {
            throw new Error(`${data.error} (Event ID: ${data.eventId})`);
          }
          
          if (data.items.length) {
            // Display the data found
            setStudentInfo(data.items[0]);
          } else {
            // Clear the data if no student was found
            setStudentInfo(undefined);
          }
          // Always trigger revalidation of this field
          trigger(fieldName);
        })
        .catch(err => {
          // If the data isn't in sync, clear it
          if (!synced) setStudentInfo(undefined);
          console.error(err);
        });
    } else {
      // If there's no value in the textbox, clear the student information
      setStudentInfo(undefined);
    }
  }, 200, [studentInfo, fieldArrayValues, index]);

  return (
    <div key={field.id} className="col-span-2 flex flex-col">
      <Input
        type="text"
        id={fieldName}
        inputRef={fieldRegistration.ref}
        name={fieldRegistration.name}
        onChange={fieldRegistration.onChange}
        onBlur={fieldRegistration.onBlur}
        autoComplete="off"
        className="rounded-md sm:text-sm"
        divClassName={clsx("rounded-md border border-gray-300 focus-within:ring-1", fieldErrors?.value ? "focus-within:border-red-500 focus-within:ring-red-500" : "focus-within:border-indigo-500 focus-within:ring-indigo-500")}
        label={`Código del integrante ${index + 1}`}
        labelClassName="text-sm font-medium text-gray-700"
        error={fieldErrors?.value?.message}
        errorClassName="text-sm text-red-500"
      />
      {studentInfo &&
        <span className="mt-2 text-sm font-medium text-gray-700">Estudiante: {studentInfo["Apellidos"]}, {studentInfo["Nombres"]}</span>
      }
    </div>
  );
};

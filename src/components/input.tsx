import clsx from 'clsx';

export type InputType =
  "button" |
  "checkbox" |
  "color" |
  "date" |
  "datetime-local" |
  "email" |
  "file" |
  "hidden" |
  "image" |
  "month" |
  "number" |
  "password" |
  "radio" |
  "range" |
  "reset" |
  "search" |
  "submit" |
  "tel" |
  "text" |
  "time" |
  "url" |
  "week";

export type IconPosition = "left" | "right";

export type LabelProps = {
  label?: string,
  labelClassName?: string,
};

export type ErrorProps = {
  error?: string,
  errorClassName?: string,
};

type PropsWeControl = "type" | "className";

type ComponentProps<T extends React.ElementType> = Omit<React.ComponentPropsWithoutRef<T>, PropsWeControl>;

type TextAreaProps = ComponentProps<"textarea"> & {
  type: "textarea",
  textAreaRef?: React.Ref<HTMLTextAreaElement>,
};

type InputProps = ComponentProps<"input"> & {
  type: InputType,
  inputRef?: React.Ref<HTMLInputElement>,
};

export type Props = (InputProps | TextAreaProps) & LabelProps & ErrorProps & {
  className?: string,
  divClassName?: string,
};

const createInputElement = (props: InputProps | TextAreaProps, className?: string) => {
  if (props.type === "textarea") {
    const { textAreaRef, ...attributes } = props;
    return <textarea ref={textAreaRef} className={className} {...attributes} />;
  } else {
    const { inputRef, ...attributes } = props;
    return <input ref={inputRef} className={className} {...attributes} />;
  }
};

export const Input = (props: Props): React.ReactElement | null => {
  const {
    className,
    divClassName,
    label,
    labelClassName,
    error,
    errorClassName,
    ...attributes
  } = props;

  const elementClassName = clsx("border-0 flex-1 block w-full focus:ring-0", className);

  return (
    <>
      {label &&
        <label htmlFor={attributes.id} className={clsx("block", labelClassName)}>
          {label}
        </label>
      }
      <div className={clsx(
        label && "mt-1",
        "flex shadow-sm transition-ring focus-within:outline-none",
        divClassName,
      )}>
        {createInputElement(attributes, elementClassName)}
      </div>
      {error &&
        <span className={clsx("mt-2 block", errorClassName)}>
          {error}
        </span>
      }
    </>
  );
};

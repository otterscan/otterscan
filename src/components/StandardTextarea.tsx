import { FC, TextareaHTMLAttributes } from "react";

const StandardTextarea: FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  ...rest
}) => (
  <textarea
    className="h-40 w-full rounded border bg-gray-50 p-2 font-mono text-gray-500 focus:outline-none"
    {...rest}
    readOnly
  />
);

export default StandardTextarea;

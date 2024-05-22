import { FC, TextareaHTMLAttributes } from "react";

interface StandardTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readOnly?: boolean;
}

const StandardTextarea: FC<StandardTextareaProps> = ({
  readOnly = true,
  ...rest
}) => (
  <textarea
    className={`h-40 w-full rounded border font-mono ${readOnly ? "bg-gray-50 text-gray-500" : "text-gray-800"} p-2 focus:outline-none`}
    {...rest}
    readOnly={readOnly}
  />
);

export default StandardTextarea;

import { FC, memo } from "react";

type CanBeEmptyTextProps = {
  text: string;
};

const CanBeEmptyText: FC<CanBeEmptyTextProps> = ({ text }) => {
  if (text.trim() === "") {
    return <span className="text-gray-300">empty</span>;
  }
  return <span>{text}</span>;
};

export default memo(CanBeEmptyText);

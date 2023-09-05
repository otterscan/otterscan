import { FC, PropsWithChildren } from "react";

const StandardTable: FC<PropsWithChildren> = ({ children }) => (
  <table className="w-full table-fixed border-b border-t border-gray-200 px-2 py-2 text-left text-sm [&>*>tr]:items-baseline">
    {children}
  </table>
);

export default StandardTable;

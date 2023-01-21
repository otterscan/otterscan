import { FC, PropsWithChildren } from "react";

const StandardTable: FC<PropsWithChildren> = ({ children }) => (
  <table className="w-full border-t border-b border-gray-200 px-2 py-2 text-sm text-left table-fixed [&>*>tr]:items-baseline">
    {children}
  </table>
);

export default StandardTable;

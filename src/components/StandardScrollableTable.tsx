import { FC, PropsWithChildren } from "react";

// TODO: replace all usage of StandardTable with this component
const StandardScrollableTable: FC<PropsWithChildren> = ({ children }) => (
  <div className="overflow-x-scroll">
    <table className="w-full table-fixed border-gray-200 px-2 py-2 text-left text-sm [&>*>tr]:items-baseline">
      {children}
    </table>
  </div>
);

export default StandardScrollableTable;

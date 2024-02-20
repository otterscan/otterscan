import { FC, PropsWithChildren } from "react";

interface StandardScrollableTableProps {
  isAuto?: boolean;
}

// TODO: replace all usage of StandardTable with this component
const StandardScrollableTable: FC<
  StandardScrollableTableProps & PropsWithChildren
> = ({ children, isAuto = false }) => (
  <div className="overflow-x-scroll">
    <table
      className={`w-full ${isAuto ? "table-auto" : "table-fixed"} border-gray-200 px-2 py-2 text-left text-sm [&>*>tr]:items-baseline`}
    >
      {children}
    </table>
  </div>
);

export default StandardScrollableTable;

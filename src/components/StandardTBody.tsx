import { FC, PropsWithChildren } from "react";

const StandardTBody: FC<PropsWithChildren> = ({ children }) => (
  <tbody className="[&>tr>td]:truncate [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr]:border-t [&>tr]:border-gray-200 hover:[&>tr]:bg-skin-table-hover">
    {children}
  </tbody>
);

export default StandardTBody;

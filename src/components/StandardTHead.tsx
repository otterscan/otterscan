import { FC, PropsWithChildren } from "react";

const StandardTHead: FC<PropsWithChildren> = ({ children }) => (
  <thead>
    <tr className="bg-gray-100 text-gray-500 [&>th]:truncate [&>th]:px-1 [&>th]:py-2">
      {children}
    </tr>
  </thead>
);

export default StandardTHead;

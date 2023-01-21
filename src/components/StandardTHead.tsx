import { FC, PropsWithChildren } from "react";

const StandardTHead: FC<PropsWithChildren> = ({ children }) => (
  <thead>
    <tr className="text-gray-500 bg-gray-100 [&>th]:px-2 [&>th]:py-2 [&>th]:truncate">
      {children}
    </tr>
  </thead>
);

export default StandardTHead;

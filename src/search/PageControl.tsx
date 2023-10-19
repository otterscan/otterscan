import { FC, memo } from "react";
import { commify } from "../utils/utils";
import PageButton from "./PageButton";

type PageControlProps = {
  pageNumber: number;
  pageSize: number;
  total: number;
};

const PageControl: FC<PageControlProps> = ({ pageNumber, pageSize, total }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isFirst = pageNumber === 1;
  const isLast = pageNumber === totalPages;

  return (
    <div className="flex items-baseline space-x-1 text-xs">
      <PageButton goToPage={1} disabled={isFirst}>
        First
      </PageButton>
      <PageButton goToPage={pageNumber - 1} disabled={isFirst}>
        {"<"}
      </PageButton>
      <PageButton goToPage={1} disabled>
        Page {commify(pageNumber)} of {commify(totalPages)}
      </PageButton>
      <PageButton goToPage={pageNumber + 1} disabled={isLast}>
        {">"}
      </PageButton>
      <PageButton goToPage={totalPages} disabled={isLast}>
        Last
      </PageButton>
    </div>
  );
};

export default memo(PageControl);

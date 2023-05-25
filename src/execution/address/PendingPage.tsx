import { FC, memo } from "react";
import StandardTBody from "../../components/StandardTBody";
import PendingItem from "./PendingItem";

type PendingPageProps = {
  rows: number;
  cols: number;
};

const PendingPage: FC<PendingPageProps> = ({ rows, cols }) => (
  <StandardTBody>
    {[...new Array(rows).keys()].map((_, i) => (
      <tr key={i}>
        {[...new Array(cols).keys()].map((_, j) => (
          <td key={j}>
            <PendingItem />
          </td>
        ))}
      </tr>
    ))}
  </StandardTBody>
);

export default memo(PendingPage);

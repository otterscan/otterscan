import { FC, memo, useContext } from "react";
import TransactionLink from "../components/TransactionLink";
import { RuntimeContext } from "../useRuntime";
import { TransactionMatch, useTransactionByHash } from "../useErigonHooks";

type ERC20temProps = {
  m: TransactionMatch;
};

const ERC20Item: FC<ERC20temProps> = ({ m: { hash } }) => {
  const { provider } = useContext(RuntimeContext);
  const res = useTransactionByHash(provider, hash);

  return (
    <tr>
      {res ? (
        <td>
          {/* {tx.status === 0 && (
            <span className="text-red-600" title="Transaction reverted">
              <FontAwesomeIcon icon={faExclamationCircle} />
            </span>
          )} */}
          <span className="truncate">
            <TransactionLink txHash={res.hash} />
          </span>
        </td>
      ) : (
        <td></td>
      )}
    </tr>
  );
};

export default memo(ERC20Item);

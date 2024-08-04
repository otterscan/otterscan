import { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Match } from "../../sourcify/useSourcify";
import Contracts from "./Contracts";

const AddressContract: FC = () => {
  const { address, match } = useOutletContext() as {
    address: string;
    match: Match | null | undefined;
  };
  return <Contracts checksummedAddress={address} match={match} />;
};

export default AddressContract;

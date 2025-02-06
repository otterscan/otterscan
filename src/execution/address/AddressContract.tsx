import { FC } from "react";
import { useOutletContext } from "react-router";
import { type AddressOutletContext } from "../AddressMainPage";
import Contracts from "./Contracts";

const AddressContract: FC = () => {
  const { address, match, whatsabiMatch } =
    useOutletContext() as AddressOutletContext;
  return (
    <Contracts checksummedAddress={address} match={match ?? whatsabiMatch} />
  );
};

export default AddressContract;

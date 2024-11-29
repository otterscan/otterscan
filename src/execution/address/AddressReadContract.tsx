import { FC } from "react";
import { useOutletContext } from "react-router";
import { type AddressOutletContext } from "../AddressMainPage";
import ReadContract from "./contract/ReadContract";

const AddressReadContract: FC = () => {
  const { address, match, whatsabiMatch } =
    useOutletContext() as AddressOutletContext;
  return (
    <ReadContract checksummedAddress={address} match={match ?? whatsabiMatch} />
  );
};

export default AddressReadContract;

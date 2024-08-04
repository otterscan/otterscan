import { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { type AddressOutletContext } from "../AddressMainPage";
import ReadContract from "./contract/ReadContract";

const AddressReadContract: FC = () => {
  const { address, match } = useOutletContext() as AddressOutletContext;
  return <ReadContract checksummedAddress={address} match={match} />;
};

export default AddressReadContract;

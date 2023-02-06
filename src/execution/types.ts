import { ChecksummedAddress } from "../types";

/**
 * Component is intrinsically associated with an address
 */
export type AddressAwareComponentProps = {
  address: ChecksummedAddress;
};

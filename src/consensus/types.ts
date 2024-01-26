/**
 * Component is associated with a CL epoch
 */
export type EpochAwareComponentProps = {
  epochNumber: number;
};

/**
 * Component is associated with a CL slot
 */
export type SlotAwareComponentProps = {
  slotNumber: number;
};

/**
 * Withdrawal details
 */
export type Withdrawal = {
  index: string;
  validator_index: string;
  address: string;
  amount: string;
};

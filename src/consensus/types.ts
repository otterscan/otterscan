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

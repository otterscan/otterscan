import { FC } from "react";

const SlotNotFound: FC = () => (
  <div>
    <p>Slot data not found.</p>
    <p>Possible causes:</p>
    <ul>
      <li>Missed slot</li>
      <li>CL does not have the slot data</li>
    </ul>
  </div>
);

export default SlotNotFound;

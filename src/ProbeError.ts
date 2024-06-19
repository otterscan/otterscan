import { ConnectionStatus } from "./types";

export class ProbeError extends Error {
  status: ConnectionStatus;
  nodeURL: string;

  constructor(status: ConnectionStatus, nodeURL: string) {
    super("Error while probing ETH node");
    this.status = status;
    this.nodeURL = nodeURL;

    Object.setPrototypeOf(this, ProbeError.prototype);
  }
}

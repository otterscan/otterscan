import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "../../../components/Tooltip";

interface VerificationStatusProps {
  runtimeMatch: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  runtimeMatch,
}) => {
  const explainer =
    runtimeMatch === "perfect"
      ? "Exact match: The onchain and compiled bytecode match exactly, including the metadata hashes."
      : "Match: The onchain and compiled bytecode match, but metadata hashes differ or don't exist.";

  return (
    <Tooltip text={explainer}>
      <div className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 rounded-md font-semibold border bg-green-100 text-green-800 border-green-200 text-sm w-auto flex-shrink-0 md:text-base">
        {" "}
        <FontAwesomeIcon
          icon={runtimeMatch === "perfect" ? faCheckDouble : faCheck}
        />{" "}
        {runtimeMatch === "perfect" && "Exact "}Match
      </div>
    </Tooltip>
  );
};

export default VerificationStatus;

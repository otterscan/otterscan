import { motion } from "framer-motion";
import React, { useState } from "react";
import { AddressAwareComponentProps } from "../../types";
import ContractVerificationSteps from "./ContractVerificationSteps";

const ExpandableContractVerificationSteps: React.FC<
  AddressAwareComponentProps
> = ({ address }) => {
  const [showVerification, setShowVerification] = useState(false);

  const handleVerifyClick = () => {
    setShowVerification(true);
  };

  return (
    <div>
      <button
        onClick={handleVerifyClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Verify Locally
      </button>
      <div>
        {showVerification && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.5 }}
          >
            <ContractVerificationSteps address={address} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExpandableContractVerificationSteps;

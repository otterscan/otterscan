import React from "react";
import { FallbackProps } from "react-error-boundary";
import StandardSubtitle from "../components/StandardSubtitle";
import ContentFrame from "./ContentFrame";
import ExternalLink from "./ExternalLink";
import StandardFrame from "./StandardFrame";

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => (
  <StandardFrame>
    <ContentFrame>
      <div className="pt-2">
        <StandardSubtitle>Something went wrong!</StandardSubtitle>
      </div>

      <div className="p-2">
        <div className="text-lg pb-2">Otterscan encountered an error.</div>

        <div>
          Please help us fix this error by creating a new issue at{" "}
          <ExternalLink href={"https://github.com/otterscan/otterscan/issues"}>
            the Otterscan issue tracker
          </ExternalLink>
          . In the issue description, include both the network name/chain ID and
          the following error trace:
        </div>

        <pre className="bg-red-100 text-xs mt-2 rounded p-2 border border-red-500 mb-2">
          {document.location.pathname + "\n\n" + error.toString() + "\n\n"}

          {error.stack}
        </pre>
      </div>
    </ContentFrame>
  </StandardFrame>
);

export default ErrorFallback;

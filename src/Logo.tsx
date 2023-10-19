import { FC, memo, useContext } from "react";
// @ts-expect-error
import Otter from "./otter.png?w=128&h=128&webp";
import { RuntimeContext } from "./useRuntime";

const Logo: FC = () => {
  const { config } = useContext(RuntimeContext);

  return (
    <div className="flex cursor-default items-center justify-center space-x-4 font-title text-6xl font-bold text-link-blue">
      <img
        className="rounded-full"
        src={Otter}
        width={96}
        height={96}
        alt="An otter scanning"
        title="An otter scanning"
      />
      <span>
        {config?.branding?.siteName || "Otterscan"}
        {config?.experimental && <span className="text-red-400">2</span>}
      </span>
    </div>
  );
};

export default memo(Logo);

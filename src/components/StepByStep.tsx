import React from "react";

export interface Step {
  name: string;
  completed: boolean;
  inProgress?: boolean;
}

const StepByStep: React.FC<{ steps: Step[] }> = ({ steps }) => {
  return (
    <div className="flex flex-col space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step.completed
                  ? "bg-green-500 text-white"
                  : `bg-white text-black ${step.inProgress ? "border-gray-500" : "border-gray-300"} border-2`
              } ${step.inProgress ? `font-bold` : ""}`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute left-[0.9375rem] top-8 h-8 border-l-2 ${
                  step.completed ? "border-green-500" : "border-gray-300"
                }`}
              ></div>
            )}
          </div>
          <span className={`${step.inProgress ? `font-bold` : ""}`}>
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepByStep;

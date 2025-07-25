import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";

export interface Step {
  name: string;
  completed: boolean;
  description?: string;
  inProgress?: boolean;
  duration?: number;
  hasError?: boolean;
}

export const useStepManagement = (defaultSteps: Step[]) => {
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const startTimes = useRef<{ [key: number]: number }>({});

  const updateStep = (
    index: number,
    progress: {
      inProgress: boolean;
      completed: boolean;
      showDuration?: boolean;
      hasError?: boolean;
    },
  ) => {
    const { inProgress, completed, showDuration } = progress;
    setSteps((prevSteps) =>
      prevSteps.map((step, i) => {
        if (i === index) {
          if (inProgress) {
            startTimes.current[index] = Date.now();
          }
          const otherSteps = {
            ...(progress.hasError !== undefined && {
              hasError: progress.hasError,
            }),
          };
          if (
            completed &&
            index in startTimes.current &&
            showDuration !== false
          ) {
            const endTime = Date.now();
            const duration =
              (endTime - (startTimes.current[index] || endTime)) / 1000;
            return { ...step, inProgress, completed, duration, ...otherSteps };
          }
          return { ...step, inProgress, completed, ...otherSteps };
        }
        return step;
      }),
    );
  };

  const clearSteps = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => ({
        ...step,
        inProgress: false,
        completed: false,
        duration: undefined,
        hasError: false,
      })),
    );
    startTimes.current = {};
  };

  return { steps, updateStep, clearSteps };
};

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
                  : `bg-white text-black ${step.hasError ? "border-red-600 text-red-600" : step.inProgress ? "border-gray-500" : "border-gray-300"} border-2`
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
            {step.description ? (
              <span className="text-xs ml-5">{step.description}</span>
            ) : null}
            {step.duration !== undefined ? (
              <span className="text-xs ml-1">
                ({step.duration.toFixed(2)}s)
              </span>
            ) : null}
            {step.inProgress && (
              <FontAwesomeIcon
                className="animate-spin ml-2"
                icon={faCircleNotch}
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StepByStep;

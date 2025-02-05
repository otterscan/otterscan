import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";
import Header from "./Header";
import ErrorFallback from "./components/ErrorFallback";

const Main: React.FC = () => {
  return (
    <>
      <Header />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<div className="w-screen h-screen"></div>}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default Main;

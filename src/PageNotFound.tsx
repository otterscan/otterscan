import React from "react";
import { NavLink } from "react-router-dom";
import StandardFrame from "./StandardFrame";

const PageNotFound: React.FC = () => (
  <StandardFrame>
    <div className="m-auto flex h-full flex-col items-center justify-center space-y-10 border">
      <span className="text-4xl">Page not found!</span>
      <NavLink className="text-link-blue hover:text-link-blue-hover" to="/">
        Click here to go to home
      </NavLink>
    </div>
  </StandardFrame>
);

export default PageNotFound;

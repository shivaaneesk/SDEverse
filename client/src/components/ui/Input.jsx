import React from "react";
import clsx from "clsx";

const Input = ({ label, type = "text", className, ...props }) => {
  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        className={clsx(
          "px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm",
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;

import React from "react";

interface Props {
  className?: string;
  children: any;
}

const Container: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={`backdrop-blur-3xl bg-opacity-50 text-white ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;

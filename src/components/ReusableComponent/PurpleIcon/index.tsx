import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const PurpleIcon = ({ className, children, size = "md" }: Props) => {
  const sizeClasses = {
    sm: "px-2 py-1",
    md: "px-4 py-2", 
    lg: "px-6 py-3"
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "iconBackground",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PurpleIcon;

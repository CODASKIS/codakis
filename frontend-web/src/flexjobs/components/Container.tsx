import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

export default function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div
      className={[
        "fj-container",
        narrow ? "max-w-3xl mx-auto" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

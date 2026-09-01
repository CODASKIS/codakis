import type { ReactNode } from "react";

type AnimatedPageProps = {
  children: ReactNode;
};

/** Conteneur de page dashboard — sans AnimatePresence pour éviter les écrans blancs à la navigation. */
export default function AnimatedPage({ children }: AnimatedPageProps) {
  return <div className="bs-motion-page">{children}</div>;
}

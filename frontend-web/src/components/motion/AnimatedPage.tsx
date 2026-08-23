import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { pageTransition, pageVariants } from "./motionPresets";

type AnimatedPageProps = {
  children: ReactNode;
};

export default function AnimatedPage({ children }: AnimatedPageProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={false}
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="bs-motion-page"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

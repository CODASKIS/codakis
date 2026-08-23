import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { defaultViewport, easeOutExpo, fadeUpVariants } from "./motionPresets";

type MotionTag = "div" | "section" | "article";

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
} as const;

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: MotionTag;
} & Omit<HTMLMotionProps<"div">, "children" | "initial" | "whileInView" | "viewport" | "variants">;

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  as = "div",
  ...props
}: RevealOnScrollProps) {
  const Component = motionTags[as];

  return (
    <Component
      className={className}
      initial="visible"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUpVariants}
      transition={{ duration: 0.5, ease: easeOutExpo, delay }}
      {...props}
    >
      {children}
    </Component>
  );
}

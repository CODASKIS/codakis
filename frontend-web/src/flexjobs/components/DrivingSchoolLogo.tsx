import { DEFAULT_DRIVING_SCHOOL_LOGO } from "../../constants/assets";
import type { DrivingSchool } from "../../data/mockDrivingSchools";

type DrivingSchoolLogoProps = {
  school: DrivingSchool;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "fj-school-logo--sm",
  md: "fj-school-logo--md",
  lg: "fj-school-logo--lg",
} as const;

export default function DrivingSchoolLogo({ school, size = "md", className }: DrivingSchoolLogoProps) {
  const sizeClass = SIZE_CLASS[size];
  const rootClass = ["fj-school-logo", sizeClass, className].filter(Boolean).join(" ");
  const logoSrc = school.logoUrl ?? DEFAULT_DRIVING_SCHOOL_LOGO;

  return (
    <div className={rootClass}>
      <img src={logoSrc} alt="" className="fj-school-logo__img" loading="lazy" />
    </div>
  );
}

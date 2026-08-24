import { useEffect, useState } from "react";
import { DEFAULT_DRIVING_SCHOOL_LOGO, resolveSchoolLogoUrl } from "../../constants/assets";
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
  const preferredSrc = resolveSchoolLogoUrl(school.logoUrl);
  const [logoSrc, setLogoSrc] = useState(preferredSrc);

  useEffect(() => {
    setLogoSrc(preferredSrc);
  }, [preferredSrc, school.id]);
  const sizeClass = SIZE_CLASS[size];
  const rootClass = ["fj-school-logo", sizeClass, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <img
        src={logoSrc}
        alt=""
        className="fj-school-logo__img"
        loading="lazy"
        onError={() => {
          if (logoSrc !== DEFAULT_DRIVING_SCHOOL_LOGO) {
            setLogoSrc(DEFAULT_DRIVING_SCHOOL_LOGO);
          }
        }}
      />
    </div>
  );
}

export const DEFAULT_DRIVING_SCHOOL_LOGO = "/images/auto-ecole.png";
export const CODAKIS_LOGO_WHITE = "/images/logo.png";

export function resolveSchoolLogoUrl(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim();
  return trimmed ? trimmed : DEFAULT_DRIVING_SCHOOL_LOGO;
}

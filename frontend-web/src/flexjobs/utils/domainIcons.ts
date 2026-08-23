import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  Car,
  CircleParking,
  FileText,
  Gauge,
  HandHeart,
  Shield,
  Signpost,
  TrafficCone,
} from "lucide-react";

const DEFAULT_DOMAIN_ICON: LucideIcon = BookOpen;

const DOMAIN_ICON_RULES: Array<{ pattern: RegExp; icon: LucideIcon }> = [
  { pattern: /signal|panneau|feu/i, icon: Signpost },
  { pattern: /priorit|intersect|croisement/i, icon: TrafficCone },
  { pattern: /circul|règle|regle/i, icon: Car },
  { pattern: /vitesse|distance|frein/i, icon: Gauge },
  { pattern: /arrêt|arret|station|parking/i, icon: CircleParking },
  { pattern: /véhicule|vehicule|éclair|eclair|equip/i, icon: Car },
  { pattern: /document|contrôle|controle|permis/i, icon: FileText },
  { pattern: /comport|alcool|substance/i, icon: AlertTriangle },
  { pattern: /vulnér|vulner|piéton|pieton|usager/i, icon: HandHeart },
  { pattern: /cemac|cameroun|particular/i, icon: Shield },
];

export function getDomainIcon(label: string, code?: string): LucideIcon {
  const haystack = `${label} ${code ?? ""}`.normalize("NFD").replace(/\p{M}/gu, "");
  for (const rule of DOMAIN_ICON_RULES) {
    if (rule.pattern.test(haystack)) return rule.icon;
  }
  return DEFAULT_DOMAIN_ICON;
}

export { DEFAULT_DOMAIN_ICON };

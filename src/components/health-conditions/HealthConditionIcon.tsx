import {
  Bandage,
  Droplet,
  Footprints,
  Heart,
  HeartPulse,
  ShieldAlert,
  Thermometer,
  Toilet,
  Utensils,
  Wind,
  type LucideIcon,
} from "lucide-react";

// One icon per condition, keyed by slug -- mirrors ZoneIcon.tsx's precedent
// of hardcoding an icon per entity slug in the frontend rather than storing
// it in the database (health_conditions has no icon column by design).
const healthConditionIcons: Record<string, LucideIcon> = {
  hiperkolesterolemia: Heart,
  "diabetes-melitus": Droplet,
  "gastritis-maag": Utensils,
  demam: Thermometer,
  diare: Toilet,
  "hiperurisemia-asam-urat": Footprints,
  alergi: ShieldAlert,
  hipertensi: HeartPulse,
  "common-cold-pilek-batuk": Wind,
  "obat-luka": Bandage,
};

const defaultIcon: LucideIcon = Heart;

type HealthConditionIconProps = {
  className?: string;
  slug: string;
};

export function HealthConditionIcon({ className, slug }: HealthConditionIconProps) {
  const Icon = healthConditionIcons[slug] ?? defaultIcon;

  return <Icon aria-hidden="true" className={className} />;
}

import {
  Waves,
  Trees,
  Sun,
  Car,
  Sofa,
  Wind,
  MoveVertical,
  Shield,
  Flame,
  Eye,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

const REGISTRY: Record<string, LucideIcon> = {
  waves: Waves,
  trees: Trees,
  sun: Sun,
  car: Car,
  sofa: Sofa,
  wind: Wind,
  "move-vertical": MoveVertical,
  shield: Shield,
  flame: Flame,
  eye: Eye,
};

export function getFeatureIcon(slug: string | null): LucideIcon {
  if (!slug) return CheckCircle2;
  return REGISTRY[slug] ?? CheckCircle2;
}

import { PageTransition } from "@/components/shared/page-transition";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

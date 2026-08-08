import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth/guards";
export default async function StudentLayout({ children }: LayoutProps<"/student">) { const { profile } = await requireRole("student"); return <><AppHeader name={profile.full_name} />{children}</>; }

import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth/guards";
export default async function TeacherLayout({ children }: LayoutProps<"/teacher">) { const { profile } = await requireRole("teacher"); return <><AppHeader name={profile.full_name} role="teacher" />{children}</>; }

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { PatientPortal } from "@/components/portal/PatientPortal";

export default async function PatientPortalPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_session");

  if (!authCookie) {
    redirect("/login");
  }

  const session = JSON.parse(authCookie.value);
  const db = await readDb();

  const user = db.users.find((u: any) => u.id === session.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientPortal user={user} />
    </main>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import type { Appointment, Doctor } from "@/types";

export default async function StaffDashboardPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_session");

  if (!authCookie) {
    redirect("/login");
  }

  const session = await verifyToken(authCookie.value);
  if (!session || session.role !== "staff") {
    redirect("/login");
  }

  const db = await readDb();

  const user = db.users.find((u: any) => u.id === session.id);
  if (!user) {
    redirect("/login");
  }

  // Fetch all appointments across all patients, sorted
  const appointments: Appointment[] = [...db.appointments].sort(
    (a: any, b: any) =>
      new Date(a.dateTimeUtc).getTime() - new Date(b.dateTimeUtc).getTime(),
  );

  const doctors: Doctor[] = db.doctors;

  // The database saves doctor schedules as a record of { [doctorId]: string[] }
  const schedulesMap: Record<string, string[]> = db.schedules || {};

  return (
    <main className="min-h-screen bg-slate-50">
      <StaffDashboard
        user={user}
        appointments={appointments}
        doctors={doctors}
        schedulesMap={schedulesMap}
      />
    </main>
  );
}

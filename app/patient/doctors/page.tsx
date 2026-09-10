import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { verifyToken } from "@/lib/session";
import { PatientPortal } from "@/components/portal/PatientPortal";
import type { User, Appointment, Doctor } from "@/types";

export default async function PatientPortalPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_session");

  if (!authCookie) {
    redirect("/login");
  }

  const session = await verifyToken(authCookie.value);
  if (!session) {
    redirect("/login");
  }
  const db = await readDb();

  const user = db.users.find((u: User) => u.id === session.id);

  if (!user) {
    redirect("/login");
  }

  // Fetch data natively on the server to pass down to Client Components
  const appointments = db.appointments
    .filter((apt: Appointment) => apt.patientId === user.id)
    .sort(
      (a: Appointment, b: Appointment) =>
        new Date(a.dateTimeUtc).getTime() - new Date(b.dateTimeUtc).getTime(),
    );

  const doctorsMap: Record<string, string> = {};
  db.doctors.forEach((d: Doctor) => {
    doctorsMap[d.id] = d.name;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientPortal
        user={user}
        appointments={appointments}
        doctorsMap={doctorsMap}
        doctors={db.doctors}
      />
    </main>
  );
}

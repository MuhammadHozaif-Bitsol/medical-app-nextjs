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

  // Fetch data natively on the server to pass down to Client Components
  const appointments = db.appointments
    .filter((apt: any) => apt.patientId === user.id)
    .sort(
      (a: any, b: any) =>
        new Date(a.dateTimeUtc).getTime() - new Date(b.dateTimeUtc).getTime()
    );

  const doctorsMap: Record<string, string> = {};
  db.doctors.forEach((d: any) => {
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

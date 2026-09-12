import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  if (!session?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id as string },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const user: User = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as "patient" | "staff",
  };

  // Fetch appointments and doctors in parallel from PostgreSQL
  const [rawAppointments, rawDoctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: user.id },
      orderBy: { dateTimeUtc: "asc" },
    }),
    prisma.doctor.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const appointments: Appointment[] = rawAppointments.map((apt) => ({
    id: apt.id,
    doctorId: apt.doctorId,
    patientId: apt.patientId,
    patientName: apt.patientName,
    dateTimeUtc: apt.dateTimeUtc.toISOString(),
    status: apt.status as "confirmed" | "cancelled",
  }));

  const doctors: Doctor[] = rawDoctors.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    avatarUrl: d.avatarUrl ?? undefined,
  }));

  const doctorsMap: Record<string, string> = {};
  for (const d of doctors) {
    doctorsMap[d.id] = d.name;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PatientPortal
        user={user}
        appointments={appointments}
        doctorsMap={doctorsMap}
        doctors={doctors}
      />
    </main>
  );
}

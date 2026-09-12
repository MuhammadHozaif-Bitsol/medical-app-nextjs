import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/session";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import type { Appointment, Doctor, User } from "@/types";

type RawAppointment = {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  dateTimeUtc: Date;
  status: string;
};

type RawDoctor = {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string | null;
};

type RawSchedule = {
  id: string;
  doctorId: string;
  slots: string[];
};

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

  // Fetch all appointments, doctors, and schedules in parallel from PostgreSQL
  const [rawAppointments, rawDoctors, rawSchedules] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { dateTimeUtc: "asc" },
    }),
    prisma.doctor.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.schedule.findMany(),
  ]);

  const appointments: Appointment[] = rawAppointments.map(
    (apt: RawAppointment) => ({
      id: apt.id,
      doctorId: apt.doctorId,
      patientId: apt.patientId,
      patientName: apt.patientName,
      dateTimeUtc: apt.dateTimeUtc.toISOString(),
      status: apt.status as "confirmed" | "cancelled",
    }),
  );

  const doctors: Doctor[] = rawDoctors.map((d: RawDoctor) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    avatarUrl: d.avatarUrl ?? undefined,
  }));

  const schedulesMap: Record<string, string[]> = {};
  for (const s of rawSchedules as RawSchedule[]) {
    schedulesMap[s.doctorId] = s.slots;
  }

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

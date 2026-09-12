"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";
import type { Appointment, Doctor } from "@/types";

async function requireAuth() {
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");
  if (!authSession) {
    throw new Error("Unauthorized");
  }
  const session = await verifyToken(authSession.value);
  if (!session) {
    throw new Error("Invalid Session");
  }
  return session;
}

export async function getDoctors(): Promise<Doctor[]> {
  await requireAuth();
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: "asc" },
  });
  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    avatarUrl: d.avatarUrl ?? undefined,
  }));
}

export async function getAppointments(): Promise<Appointment[]> {
  const session = await requireAuth();

  const where = session.role === "patient" ? { patientId: session.id as string } : {};
  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { dateTimeUtc: "asc" },
  });

  return appointments.map((a) => ({
    id: a.id,
    doctorId: a.doctorId,
    patientId: a.patientId,
    patientName: a.patientName,
    dateTimeUtc: a.dateTimeUtc.toISOString(),
    status: a.status as "confirmed" | "cancelled",
  }));
}

export async function getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
  await requireAuth();

  // Get dynamic schedule assigned to the doctor, or fallback to default
  const schedule = await prisma.schedule.findUnique({
    where: { doctorId },
  });
  const allSlots = schedule?.slots || ["09:00", "10:00", "11:00", "14:00", "15:00"];

  // Find confirmed appointments for this doctor on the selected date
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: "confirmed",
      dateTimeUtc: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const bookedSlotsList = bookedAppointments
    .map((apt) => {
      const timeMatch = apt.dateTimeUtc.toISOString().match(/T(\d{2}:\d{2})/);
      return timeMatch ? timeMatch[1] : null;
    })
    .filter(Boolean);

  const bookedSlots = new Set(bookedSlotsList);
  return allSlots.filter((slot) => !bookedSlots.has(slot));
}

export async function bookAppointment(payload: Omit<Appointment, "id" | "status">): Promise<Appointment> {
  const session = await requireAuth();
  if (session.role !== "patient" || payload.patientId !== session.id) {
    throw new Error("Forbidden: Cannot book appointments for other patients");
  }

  const appointmentDate = new Date(payload.dateTimeUtc);

  // Validate that the slot is not already taken
  const isTaken = await prisma.appointment.findFirst({
    where: {
      doctorId: payload.doctorId,
      status: "confirmed",
      dateTimeUtc: appointmentDate,
    },
  });

  if (isTaken) {
    throw new Error("This slot is already booked. Please choose another time.");
  }

  const newAppointment = await prisma.appointment.create({
    data: {
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      dateTimeUtc: appointmentDate,
      status: "confirmed",
    },
  });

  revalidatePath("/patient/doctors");
  revalidatePath("/patient/appointments");
  revalidatePath("/staff/dashboard");

  return {
    id: newAppointment.id,
    doctorId: newAppointment.doctorId,
    patientId: newAppointment.patientId,
    patientName: newAppointment.patientName,
    dateTimeUtc: newAppointment.dateTimeUtc.toISOString(),
    status: newAppointment.status as "confirmed" | "cancelled",
  };
}

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  const session = await requireAuth();

  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!apt) {
    return false;
  }

  // Auth Check: Ensure only the patient or a staff member can cancel this
  if (session.role === "patient" && apt.patientId !== session.id) {
    throw new Error("Forbidden: You do not own this appointment");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "cancelled" },
  });

  revalidatePath("/patient/doctors");
  revalidatePath("/patient/appointments");
  revalidatePath("/staff/dashboard");
  return true;
}

export async function askAIAssistant(symptoms: string) {
  await requireAuth();

  const specialty =
    symptoms.toLowerCase().includes("heart") ||
    symptoms.toLowerCase().includes("chest")
      ? "Cardiology"
      : "General Practice";

  const doctor =
    (await prisma.doctor.findFirst({
      where: { specialty },
    })) || (await prisma.doctor.findFirst());

  if (!doctor) {
    throw new Error("No doctors available");
  }

  return {
    suggestion: doctor.id,
    reason: `Based on your symptoms, a ${specialty} specialist is recommended.`,
  };
}

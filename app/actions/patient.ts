"use server";

import { readDb, writeDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Next.js Best Practice: Always verify auth *inside* the Server Action.
async function requireAuth() {
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");
  if (!authSession) {
    throw new Error("Unauthorized");
  }
  return JSON.parse(authSession.value);
}

export async function getDoctors() {
  await requireAuth();
  const db = await readDb();
  return db.doctors;
}

export async function getAppointments() {
  const session = await requireAuth();
  const db = await readDb();
  // Ensure we only return appointments for the current user if they are a patient
  if (session.role === "patient") {
    return db.appointments.filter((a: any) => a.patientId === session.id);
  }
  return db.appointments;
}

export async function getAvailableSlots(doctorId: string, date: string) {
  await requireAuth();
  const db = await readDb();
  
  const allSlots = ["09:00", "10:00", "11:00", "14:00", "15:00"];
  
  // Find booked slots for this doctor on the selected date
  const bookedSlots = db.appointments
    .filter((apt: any) => 
      apt.doctorId === doctorId && 
      apt.status === "confirmed" &&
      apt.dateTimeUtc.includes(date)
    )
    .map((apt: any) => {
      // dateTimeUtc looks like "2026-08-31T10:00:00-04:00"
      // Extract the time portion HH:mm
      const timeMatch = apt.dateTimeUtc.match(/T(\d{2}:\d{2})/);
      return timeMatch ? timeMatch[1] : null;
    })
    .filter(Boolean);

  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

export async function bookAppointment(payload: any) {
  const session = await requireAuth();
  if (session.role !== "patient" || payload.patientId !== session.id) {
    throw new Error("Forbidden: Cannot book appointments for other patients");
  }

  const db = await readDb();

  // Validate that the slot is not already taken
  // The payload.dateTimeUtc looks like "2026-08-31T10:00:00+05:00"
  const isTaken = db.appointments.some((apt: any) => 
    apt.doctorId === payload.doctorId && 
    apt.status === "confirmed" && 
    apt.dateTimeUtc === payload.dateTimeUtc
  );

  if (isTaken) {
    throw new Error("This slot is already booked. Please choose another time.");
  }

  const newAppointment = {
    ...payload,
    id: `apt${Date.now()}`,
    status: "confirmed",
  };
  db.appointments.push(newAppointment);
  await writeDb(db);
  revalidatePath("/patient/doctors");
  return newAppointment;
}

export async function cancelAppointment(appointmentId: string) {
  const session = await requireAuth();
  const db = await readDb();
  const index = db.appointments.findIndex((a: any) => a.id === appointmentId);
  
  if (index !== -1) {
    const apt = db.appointments[index];
    
    // Auth Check: Ensure only the patient or a staff member can cancel this
    if (session.role === "patient" && apt.patientId !== session.id) {
      throw new Error("Forbidden: You do not own this appointment");
    }

    db.appointments[index].status = "cancelled";
    await writeDb(db);
    revalidatePath("/patient/doctors");
    return true;
  }
  return false;
}

export async function askAIAssistant(symptoms: string) {
  await requireAuth();
  const db = await readDb();
  
  const specialty =
    symptoms.toLowerCase().includes("heart") ||
    symptoms.toLowerCase().includes("chest")
      ? "Cardiology"
      : "General Practice";

  const doctor =
    db.doctors.find((d: any) => d.specialty === specialty) || db.doctors[0];

  return {
    suggestion: doctor.id,
    reason: `Based on your symptoms, a ${specialty} specialist is recommended.`,
  };
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";

async function requireStaffAuth() {
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");
  if (!authSession) {
    throw new Error("Unauthorized");
  }
  const session = await verifyToken(authSession.value);
  if (session?.role !== "staff") {
    throw new Error("Forbidden: Staff access only");
  }
  return session;
}

export async function updateDoctorSchedule(doctorId: string, slots: string[]) {
  await requireStaffAuth();

  await prisma.schedule.upsert({
    where: { doctorId },
    update: { slots },
    create: {
      doctorId,
      slots,
    },
  });

  revalidatePath("/staff/dashboard");
  revalidatePath("/patient/doctors");
  return true;
}

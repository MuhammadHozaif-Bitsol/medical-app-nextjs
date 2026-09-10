import { PrismaClient, Role, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent database reset & seed...");

  // 1. Delete all existing records in reverse dependency order to avoid foreign key violations
  await prisma.appointment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Cleaned up existing database records.");

  // 2. Seed Users
  const usersData = [
    {
      id: "s1",
      name: "Admin Staff",
      email: "staff@clinic.com",
      password: "password123",
      role: Role.staff,
    },
    {
      id: "p1788091280893",
      name: "hozaif",
      email: "hozaif@patient.com",
      password: "password123",
      role: Role.patient,
    },
    {
      id: "p1788105146909",
      name: "admin",
      email: "admin@gmail.com",
      password: "BaLFqR2tolC3vrEo10Uq4PnLdA6K92frCUpGPfYw",
      role: Role.patient,
    },
  ];

  for (const user of usersData) {
    await prisma.user.create({ data: user });
  }
  console.log(`👤 Seeded ${usersData.length} users.`);

  // 3. Seed Doctors
  const doctorsData = [
    {
      id: "d1",
      name: "Dr. Ayesha",
      specialty: "General Practice",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: "d2",
      name: "Dr. Bilal",
      specialty: "Cardiology",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "d3",
      name: "Dr. Sana",
      specialty: "Neurology",
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: "d4",
      name: "Dr. Usman",
      specialty: "Orthopedics",
      avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      id: "d5",
      name: "Dr. Fatima",
      specialty: "Pediatrics",
      avatarUrl: "https://randomuser.me/api/portraits/women/90.jpg",
    },
  ];

  for (const doc of doctorsData) {
    await prisma.doctor.create({ data: doc });
  }
  console.log(`🩺 Seeded ${doctorsData.length} doctors.`);

  // 4. Seed Schedules
  const customSchedules: Record<string, string[]> = {
    d3: ["11:30", "12:00", "14:30"],
    d5: ["13:30", "16:00", "16:30"],
  };
  const defaultSchedule = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  for (const doc of doctorsData) {
    await prisma.schedule.create({
      data: {
        doctorId: doc.id,
        slots: customSchedules[doc.id] || defaultSchedule,
      },
    });
  }
  console.log(`📅 Seeded doctor schedules.`);

  // 5. Seed Appointments
  const appointmentsData = [
    {
      id: "apt1788091319391",
      doctorId: "d2",
      patientId: "p1788091280893",
      patientName: "hozaif",
      dateTimeUtc: new Date("2026-08-31T10:00:00+05:00"),
      status: AppointmentStatus.confirmed,
    },
    {
      id: "apt1788091505842",
      doctorId: "d2",
      patientId: "p1788091280893",
      patientName: "hozaif",
      dateTimeUtc: new Date("2026-08-30T09:00:00+05:00"),
      status: AppointmentStatus.cancelled,
    },
    {
      id: "apt1788091529576",
      doctorId: "d2",
      patientId: "p1788091280893",
      patientName: "hozaif",
      dateTimeUtc: new Date("2026-08-30T14:00:00+05:00"),
      status: AppointmentStatus.cancelled,
    },
    {
      id: "apt1788100224631",
      doctorId: "d1",
      patientId: "p1788091280893",
      patientName: "hozaif",
      dateTimeUtc: new Date("2026-09-01T09:00:00+05:00"),
      status: AppointmentStatus.confirmed,
    },
    {
      id: "apt1788105197563",
      doctorId: "d1",
      patientId: "p1788105146909",
      patientName: "admin",
      dateTimeUtc: new Date("2026-08-30T09:00:00+05:00"),
      status: AppointmentStatus.confirmed,
    },
    {
      id: "apt1788105762378",
      doctorId: "d3",
      patientId: "p1788105146909",
      patientName: "admin",
      dateTimeUtc: new Date("2026-08-31T14:30:00+05:00"),
      status: AppointmentStatus.confirmed,
    },
  ];

  for (const apt of appointmentsData) {
    await prisma.appointment.create({ data: apt });
  }
  console.log(`📋 Seeded ${appointmentsData.length} appointments.`);

  console.log("✨ Database idempotent reset & seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

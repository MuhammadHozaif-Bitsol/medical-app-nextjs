import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent database reset & seed...");

  // 1. Delete all existing records in reverse dependency order to avoid foreign key violations
  await prisma.appointment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Cleaned up existing database records.");

  // 2. Seed Staff User only (Password hashed with bcrypt)
  const hashedPassword = await bcrypt.hash("password123", 10);
  const staffUser = await prisma.user.create({
    data: {
      id: "s1",
      name: "Admin Staff",
      email: "staff@clinic.com",
      password: hashedPassword,
      role: Role.staff,
    },
  });
  console.log(`👤 Seeded staff user: ${staffUser.email} (password: password123, securely hashed).`);
  console.log("ℹ️  No sample patients seeded — patients will be registered via the app.");

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

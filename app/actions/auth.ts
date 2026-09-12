"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function loginAction(email: string, password?: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Set auth cookie
  const cookieStore = await cookies();
  const token = await signToken({ id: user.id, role: user.role });

  cookieStore.set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  if (user.role === "staff") {
    redirect("/staff/dashboard");
  } else {
    redirect("/patient/doctors");
  }
}

export async function registerAction(
  name: string,
  email: string,
  password?: string,
) {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password with bcrypt before storing in PostgreSQL
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "patient",
    },
  });

  // Set auth cookie
  const cookieStore = await cookies();
  const token = await signToken({ id: newUser.id, role: newUser.role });

  cookieStore.set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  redirect("/patient/doctors");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}

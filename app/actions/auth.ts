"use server";

import { readDb, writeDb } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken } from "@/lib/session";
import type { User } from "@/types";

export async function loginAction(email: string, password?: string) {
  const db = await readDb();

  // Minimal auth logic for prototype
  const user = db.users.find((u: User & { password?: string }) => u.email === email);
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }

  // Set auth cookie
  const cookieStore = await cookies();
  const token = await signToken({ id: user.id, role: user.role });
  
  cookieStore.set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
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
  const db = await readDb();

  const normalizedInputEmail = typeof email === "string" ? email.toLowerCase() : "";
  const existingUser = db.users.some((u: User) => {
    if (typeof u.email === "string") {
      return u.email.toLowerCase() === normalizedInputEmail;
    }
    return false;
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const newUser = {
    id: `p${Date.now()}`,
    name,
    email,
    password,
    role: "patient",
  };

  db.users.push(newUser);
  await writeDb(db);

  // Set auth cookie
  const cookieStore = await cookies();
  const token = await signToken({ id: newUser.id, role: newUser.role });

  cookieStore.set("auth_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/patient/doctors");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}

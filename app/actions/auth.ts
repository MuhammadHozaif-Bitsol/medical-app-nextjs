"use server";

import { readDb, writeDb } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function loginAction(email: string, password?: string) {
  const db = await readDb();
  
  // Minimal auth logic for prototype
  const user = db.users.find((u: any) => u.email === email);
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }

  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_session", JSON.stringify({ id: user.id, role: user.role }), {
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

export async function registerAction(name: string, email: string, password?: string) {
  const db = await readDb();
  
  if (db.users.find((u: any) => u.email === email)) {
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
  cookieStore.set("auth_session", JSON.stringify({ id: newUser.id, role: newUser.role }), {
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

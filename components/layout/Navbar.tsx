import React from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/session";
import { SignOutButton } from "@/components/layout/SignOutButton";
import type { User } from "@/types";

export default async function Navbar() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_session");
  let user: User | null = null;

  if (authCookie) {
    const session = await verifyToken(authCookie.value);
    if (session?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id as string },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role as "patient" | "staff",
        };
      }
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            +
          </div>
          <span className="font-bold text-xl text-slate-800">MedBook</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Hi, <strong className="text-slate-800">{user.name}</strong> (
              {user.role})
            </span>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}

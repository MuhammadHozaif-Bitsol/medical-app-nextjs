import React from "react";
import type { Doctor } from "@/types";
import { Button } from "./Button";
import Image from "next/image";

export interface DoctorCardProps {
  doctor: Doctor;
  onBookClick?: (doctorId: string) => void;
  isSuggested?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBookClick,
  isSuggested,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border bg-white flex flex-col sm:flex-row gap-4 items-center sm:items-start ${
        isSuggested
          ? "border-blue-400 shadow-md ring-1 ring-blue-400"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <div className="w-24 h-24 rounded-full shrink-0 bg-slate-100 relative overflow-hidden">
        <Image
          src={doctor.avatarUrl || ""}
          alt={doctor.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <h3 className="font-bold text-lg text-slate-800">{doctor.name}</h3>
          {isSuggested && (
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              AI Suggested
            </span>
          )}
        </div>
        <p className="text-slate-600 font-medium">{doctor.specialty}</p>
      </div>
      {onBookClick && (
        <div className="shrink-0 mt-4 sm:mt-0">
          <Button onClick={() => onBookClick(doctor.id)}>Book Slot</Button>
        </div>
      )}
    </div>
  );
};

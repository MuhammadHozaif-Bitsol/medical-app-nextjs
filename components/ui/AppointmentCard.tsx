import React from "react";
import type { Appointment } from "@/types";
import { Button } from "./Button";
import { format, parseISO } from "date-fns";

export interface AppointmentCardProps {
  appointment: Appointment;
  doctorName?: string;
  onCancelClick?: (appointmentId: string) => void;
  isStaffView?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  doctorName,
  onCancelClick,
  isStaffView,
}) => {
  // Parse UTC string and format to local time
  const localDate = parseISO(appointment.dateTimeUtc);
  const dateStr = format(localDate, "MMM d, yyyy");
  const timeStr = format(localDate, "h:mm a");

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold text-slate-800 text-lg">
            {dateStr} at {timeStr}
          </h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              appointment.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {appointment.status}
          </span>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          {isStaffView && (
            <p>
              Patient:{" "}
              <span className="font-medium text-slate-800">
                {appointment.patientName}
              </span>
            </p>
          )}
          {doctorName ? (
            <p>
              Doctor:{" "}
              <span className="font-medium text-slate-800">{doctorName}</span>
            </p>
          ) : (
            <p>Doctor ID: {appointment.doctorId}</p>
          )}
        </div>
      </div>
      {appointment.status === "confirmed" && onCancelClick && (
        <div className="flex items-center">
          <Button
            variant="danger"
            onClick={() => onCancelClick(appointment.id)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

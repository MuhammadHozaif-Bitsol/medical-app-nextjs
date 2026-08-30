"use client";
import React, { useState } from "react";
import type { Appointment, User, Doctor } from "@/types";
import { AIAssistant } from "@/features/assistant/AIAssistant";
import { AppointmentBookingForm } from "@/features/appointments/AppointmentBookingForm";
import { AppointmentCard } from "@/components/ui/AppointmentCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cancelAppointment } from "@/app/actions/patient";

export interface PatientPortalProps {
  user: User;
  appointments: Appointment[];
  doctorsMap: Record<string, string>;
  doctors: Doctor[];
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ 
  user, 
  appointments, 
  doctorsMap,
  doctors
}) => {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const requestCancel = (appointmentId: string) => {
    setCancelId(appointmentId);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    setIsCanceling(true);
    await cancelAppointment(cancelId);
    // Since cancelAppointment calls revalidatePath, Next.js will refresh our props!
    setCancelId(null);
    setIsCanceling(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Patient Portal</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Welcome back, {user.name}. Book and manage your appointments here.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <AppointmentBookingForm
              onSuccess={() => {}} // No longer needs to manually refresh client state!
              userId={user.id}
              userName={user.name}
            />
          </section>
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Your Appointments
            </h2>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    doctorName={doctorsMap[apt.doctorId]}
                    onCancelClick={requestCancel}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-slate-500 text-center">
                You have no upcoming appointments.
              </div>
            )}
          </section>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <AIAssistant doctors={doctors} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              No, Keep it
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              isLoading={isCanceling}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

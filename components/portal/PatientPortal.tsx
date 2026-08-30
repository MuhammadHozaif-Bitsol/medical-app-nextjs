"use client";
import React, { useEffect, useState, useCallback } from "react";
import type { Appointment, User } from "@/types";
import { AIAssistant } from "@/features/assistant/AIAssistant";
import { AppointmentBookingForm } from "@/features/appointments/AppointmentBookingForm";
import { AppointmentCard } from "@/components/ui/AppointmentCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  getAppointments,
  getDoctors,
  cancelAppointment,
} from "@/app/actions/patient";

export const PatientPortal: React.FC<{ user: User }> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsMap, setDoctorsMap] = useState<Record<string, string>>({});
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([getAppointments(), getDoctors()])
      .then(([apts, docs]) => {
        const dMap: Record<string, string> = {};
        docs.forEach((d: any) => (dMap[d.id] = d.name));
        setDoctorsMap(dMap);

        const userApts = apts
          .filter((apt: any) => apt.patientId === user.id)
          .sort(
            (a: any, b: any) =>
              new Date(a.dateTimeUtc).getTime() -
              new Date(b.dateTimeUtc).getTime(),
          );
        setAppointments(userApts);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const requestCancel = (appointmentId: string) => {
    setCancelId(appointmentId);
  };

  const confirmCancel = async () => {
    if (!cancelId) return;
    setIsLoading(true);
    const success = await cancelAppointment(cancelId);
    if (success) {
      setCancelId(null);
      fetchAppointments();
    } else {
      setIsLoading(false);
    }
  };

  let appointmentsContent;
  if (isLoading && appointments.length === 0) {
    appointmentsContent = (
      <div className="text-slate-500">Loading appointments...</div>
    );
  } else if (appointments.length > 0) {
    appointmentsContent = (
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
    );
  } else {
    appointmentsContent = (
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-slate-500 text-center">
        You have no upcoming appointments.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Patient Portal</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Welcome back, {user?.name}. Book and manage your appointments here.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Booking Form & Appointments */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <AppointmentBookingForm
              onSuccess={fetchAppointments}
              userId={user.id}
              userName={user.name}
            />
          </section>
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Your Appointments
            </h2>
            {appointmentsContent}
          </section>
        </div>
        {/* Right Column: AI Assistant */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <AIAssistant />
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
              isLoading={isLoading}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { parse, formatISO } from "date-fns";
import type { Doctor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getDoctors,
  getAvailableSlots,
  bookAppointment,
} from "@/app/actions/patient";

interface BookingFormData {
  doctorId: string;
  date: string;
  time: string;
}

interface AppointmentBookingFormProps {
  onSuccess: () => void;
  userId: string;
  userName: string;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
  onSuccess,
  userId,
  userName,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    defaultValues: {
      doctorId: "",
      date: "",
      time: "",
    },
  });

  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  // Fetch doctors on mount
  useEffect(() => {
    getDoctors().then((res) => {
      if (res) setDoctors(res);
    });
  }, []);

  // Fetch available slots when doctor AND date are selected
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      setIsFetchingSlots(true);
      getAvailableSlots(selectedDoctorId, selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
          setValue("time", "");
        })
        .catch((err) => {
          console.error("Failed to fetch slots:", err);
          setAvailableSlots([]);
        })
        .finally(() => setIsFetchingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctorId, selectedDate, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    if (!userId) return;

    try {
      setError(null);
      const localDateTime = parse(
        `${data.date} ${data.time}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );

      const dateTimeUtc = formatISO(localDateTime);

      const appointmentPayload = {
        doctorId: data.doctorId,
        patientId: userId,
        patientName: userName,
        dateTimeUtc,
      };

      const result = await bookAppointment(appointmentPayload);
      if (result) {
        reset();
        onSuccess();
      }
    } catch (e: any) {
      setError(e.message || "Failed to book appointment");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-6">
        Book an Appointment
      </h3>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="doctor-select"
            className="text-sm font-medium text-slate-700"
          >
            Select Specialist
          </label>
          <select
            id="doctor-select"
            {...register("doctorId", { required: "Please select a doctor" })}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Choose a doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <span className="text-sm text-red-500">
              {errors.doctorId.message}
            </span>
          )}
        </div>

        <Input
          type="date"
          label="Preferred Date"
          {...register("date", { required: "Please select a date" })}
          error={errors.date?.message}
          min={new Date().toISOString().split("T")[0]}
          disabled={!selectedDoctorId}
        />

        {selectedDoctorId && selectedDate && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Available Times
            </span>

            {(() => {
              if (isFetchingSlots) {
                return (
                  <div className="text-sm text-slate-500 animate-pulse">
                    Loading slots...
                  </div>
                );
              }
              if (availableSlots.length > 0) {
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() =>
                          setValue("time", time, { shouldValidate: true })
                        }
                        className={`py-2 px-3 text-sm rounded-md border font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                );
              }
              return (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded border">
                  No slots available on this date.
                </div>
              );
            })()}
            <input
              type="hidden"
              {...register("time", { required: "Please select a time slot" })}
            />
            {errors.time && (
              <span className="text-sm text-red-500">
                {errors.time.message}
              </span>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!selectedDoctorId || !selectedDate || !selectedTime}
          >
            Confirm Booking
          </Button>
        </div>
      </form>
    </div>
  );
};

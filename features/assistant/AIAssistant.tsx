"use client";
import React, { useState } from "react";
import type { Doctor } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { Bot, AlertCircle } from "lucide-react";
import { askAIAssistant } from "@/app/actions/patient";

export interface AIAssistantProps {
  doctors: Doctor[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ doctors }) => {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<{
    doctor: Doctor;
    reason: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAction = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setResult(null);
    setIsLoading(true);
    setError(null);

    try {
      const response = await askAIAssistant(symptoms);

      if (response && doctors.length > 0) {
        const matchedDoctor = doctors.find((d) => d.id === response.suggestion);
        if (matchedDoctor) {
          setResult({ doctor: matchedDoctor, reason: response.reason });
        }
      }
      setSymptoms("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">AI Assistant</h2>
          <p className="text-sm text-slate-500">
            Describe your symptoms to find the right specialist.
          </p>
        </div>
      </div>

      <form onSubmit={submitAction} className="flex items-center gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="e.g., I have been experiencing severe chest pain..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={isLoading}
            className="h-10 text-sm"
          />
        </div>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!symptoms.trim()}
          className="shrink-0 whitespace-nowrap h-10 px-4 text-sm"
        >
          Ask AI
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-2 mb-4 text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> This is an AI suggestion, not a
              medical diagnosis.
            </p>
          </div>

          <p className="text-slate-700 font-medium mb-3">
            <span className="text-blue-600 font-bold">Reasoning: </span>
            {result.reason}
          </p>

          <DoctorCard doctor={result.doctor} isSuggested={true} />
        </div>
      )}
    </div>
  );
};

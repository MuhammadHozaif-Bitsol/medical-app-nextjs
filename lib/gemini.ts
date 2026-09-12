import { GoogleGenAI } from "@google/genai";

export interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
}

export interface RecommendationResult {
  doctorId: string;
  reason: string;
}

/**
 * Fallback heuristic in case the Gemini API key is missing, network fails, or quota is reached.
 * Guarantees that the booking and suggestion flow never crashes.
 */
function getHeuristicFallback(
  symptoms: string,
  doctors: DoctorOption[],
): RecommendationResult {
  const lower = symptoms.toLowerCase();
  let targetSpecialty = "General Practice";

  if (
    lower.includes("heart") ||
    lower.includes("chest") ||
    lower.includes("palpitation") ||
    lower.includes("blood pressure")
  ) {
    targetSpecialty = "Cardiology";
  } else if (
    lower.includes("head") ||
    lower.includes("brain") ||
    lower.includes("migraine") ||
    lower.includes("dizzy") ||
    lower.includes("nerve")
  ) {
    targetSpecialty = "Neurology";
  } else if (
    lower.includes("bone") ||
    lower.includes("joint") ||
    lower.includes("knee") ||
    lower.includes("fracture") ||
    lower.includes("back pain")
  ) {
    targetSpecialty = "Orthopedics";
  } else if (
    lower.includes("child") ||
    lower.includes("baby") ||
    lower.includes("infant") ||
    lower.includes("kid") ||
    lower.includes("pediatric")
  ) {
    targetSpecialty = "Pediatrics";
  }

  const matched =
    doctors.find(
      (d) => d.specialty.toLowerCase() === targetSpecialty.toLowerCase(),
    ) || doctors[0];

  return {
    doctorId: matched?.id ?? "",
    reason: `Based on your symptoms, our ${matched?.specialty ?? "General Practice"} specialist is recommended for an initial consultation.`,
  };
}

/**
 * Calls Gemini API to analyze patient symptoms and strictly match them with an available clinic doctor.
 */
export async function getDoctorRecommendation(
  symptoms: string,
  doctors: DoctorOption[],
): Promise<RecommendationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Gracefully fallback if API key is not configured or no doctors exist
  if (!apiKey || doctors.length === 0) {
    return getHeuristicFallback(symptoms, doctors);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const doctorListPrompt = doctors
      .map(
        (doc) =>
          `- Doctor ID: "${doc.id}", Name: "${doc.name}", Specialty: "${doc.specialty}"`,
      )
      .join("\n");

    const prompt = `You are a helpful clinic AI assistant for MedBook. Your role is to analyze a patient's reported symptoms and recommend the single most suitable specialist strictly from the provided list of available clinic doctors.

Available Doctors at our Clinic:
${doctorListPrompt}

Patient Symptoms:
"${symptoms}"

Strict Requirements:
1. You MUST choose a doctor ID exclusively from the available doctors above. Do not invent any doctor ID.
2. If the symptoms are vague, general, or do not clearly match a specific specialist, recommend the General Practice doctor.
3. Provide a concise, reassuring one-line reason (under 25 words) explaining why this specialist is the best starting point.
4. Do NOT provide a definitive diagnosis or medical prescription; your response is an appointment recommendation suggestion only.
5. Return JSON only with the following structure:
{
  "doctorId": "the exact doctor ID from the list",
  "reason": "one-line explanation"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for deterministic specialist matching
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      return getHeuristicFallback(symptoms, doctors);
    }

    const parsed = JSON.parse(responseText) as {
      doctorId?: string;
      reason?: string;
    };

    // Verify that the suggested doctorId strictly exists in our database list
    const validDoctor = doctors.find((d) => d.id === parsed.doctorId);
    if (validDoctor && parsed.reason) {
      return {
        doctorId: validDoctor.id,
        reason: parsed.reason.trim(),
      };
    }

    return getHeuristicFallback(symptoms, doctors);
  } catch (error) {
    console.error("Gemini recommendation failed, using fallback:", error);
    return getHeuristicFallback(symptoms, doctors);
  }
}

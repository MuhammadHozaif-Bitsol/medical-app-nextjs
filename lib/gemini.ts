import { GoogleGenAI } from "@google/genai";

export interface SpecialtyRecommendation {
  specialty: string;
  reason: string;
}

/**
 * Calls Gemini API to match the patient's symptoms strictly against allowed clinic medical specialties.
 * Only the symptom string and specialty names are transmitted (no doctor names or user data).
 */
export async function getSpecialtyRecommendation(
  symptoms: string,
  availableSpecialties: string[],
): Promise<SpecialtyRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI assistant is not available right now.");
  }

  if (availableSpecialties.length === 0) {
    throw new Error(
      "No medical specialties are currently available at the clinic.",
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const specialtiesList = availableSpecialties
      .map((spec) => `- "${spec}"`)
      .join("\n");

    const prompt = `You are a clinical assistant for MedBook clinic. Your task is to analyze patient symptoms and recommend the single most appropriate medical specialty strictly from the provided list.

Available Clinic Specialties:
${specialtiesList}

Patient Symptoms:
"${symptoms}"

Strict Rules:
1. You MUST select ONE specialty exclusively from the Available Clinic Specialties list above.
2. If symptoms are generic, mild, or do not clearly match a specific specialist, select "General Practice".
3. Provide a concise, professional one-line reason (under 25 words) explaining why this specialty is appropriate.
4. Do NOT make a medical diagnosis or prescribe treatments.
5. Return JSON only conforming to:
{
  "specialty": "exact specialty name from the list",
  "reason": "one-line explanation"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // Low temperature for consistent, deterministic specialty matching
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("AI assistant is not available right now.");
    }

    const parsed = JSON.parse(responseText) as {
      specialty?: string;
      reason?: string;
    };

    // Verify that the suggested specialty is strictly one of our available clinic specialties
    const validSpecialty = availableSpecialties.find(
      (s) => s.toLowerCase() === parsed.specialty?.trim().toLowerCase(),
    );

    if (!validSpecialty || !parsed.reason?.trim()) {
      throw new Error("AI assistant is not available right now.");
    }

    return {
      specialty: validSpecialty,
      reason: parsed.reason.trim(),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("AI assistant")) {
      throw error;
    }
    console.error("Gemini API call failed:", error);
    throw new Error("AI assistant is not available right now.");
  }
}

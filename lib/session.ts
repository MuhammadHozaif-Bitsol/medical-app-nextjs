import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "medbook-super-secret-key-12345!";
const encodedKey = new TextEncoder().encode(secretKey);

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload;
  } catch (error) {
    console.error(
      "JWT Verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}

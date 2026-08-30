import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is invalid, return empty db schema
    return {
      users: [],
      doctors: [],
      appointments: [],
      schedules: {},
    };
  }
}

export async function writeDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

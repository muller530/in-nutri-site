import { db } from "./index";
import { members } from "./schema";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  const existingAdmins = await db.select().from(members).limit(1);
  if (existingAdmins.length > 0) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash("inNutriAdmin123", 10);
  await db.insert(members).values({
    email: "admin@in-nutri.com",
    name: "Admin",
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("Default admin user created:");
  console.log("Email: admin@in-nutri.com");
  console.log("Password: inNutriAdmin123");
}


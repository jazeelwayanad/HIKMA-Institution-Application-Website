import { prisma } from "@/lib/prisma";
// @ts-ignore
import * as bcrypt from "bcryptjs";

/**
 * MIGRATION SCRIPT: Migrate old SHA-256 hashed passwords to bcryptjs
 * 
 * Use this if you have existing admins with SHA-256 hashed passwords
 * from before the bcryptjs upgrade.
 * 
 * WARNING: This script assumes you have access to the original plaintext
 * passwords. If you don't, admins will need to reset their passwords
 * through the "Forgot Password" flow (if implemented).
 */

const ADMINS_TO_MIGRATE = [
  { email: "alwardavga@gmail.com", plainPassword: "password123" },
  // Add more as needed
];

async function migratePasswords() {
  console.log("Starting password migration...");

  for (const admin of ADMINS_TO_MIGRATE) {
    try {
      const hashedPassword = await bcrypt.hash(admin.plainPassword, 10);
      
      await prisma.admin.update({
        where: { email: admin.email },
        data: { password: hashedPassword },
      });

      console.log(`✓ Migrated: ${admin.email}`);
    } catch (err: any) {
      console.error(`✗ Failed to migrate ${admin.email}:`, err.message);
    }
  }

  console.log("Migration complete!");
}

migratePasswords()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

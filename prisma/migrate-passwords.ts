import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ADMINS_TO_MIGRATE: Array<{ email: string; plainPassword: string }> = [
];

async function migratePasswords() {
  if (ADMINS_TO_MIGRATE.length === 0) {
    console.log("No admins to migrate. Update the ADMINS_TO_MIGRATE array.");
    return;
  }

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

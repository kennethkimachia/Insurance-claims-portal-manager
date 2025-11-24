import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting policy backfill...");

  const users = await prisma.user.findMany({
    include: {
      policies: true,
    },
  });

  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    const hasMotor = user.policies.some((p) => p.type === "MOTOR");
    const hasBurglary = user.policies.some((p) => p.type === "BURGLARY");

    if (!hasMotor) {
      // Generate unique number: POL-M-timestamp-random
      const motorPolicyNumber = `POL-M-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      
      await prisma.policy.create({
        data: {
          policy_number: motorPolicyNumber,
          type: "MOTOR",
          start_date: new Date(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          userId: user.id,
        },
      });
      console.log(`Created MOTOR policy ${motorPolicyNumber} for user ${user.email}`);
    }

    if (!hasBurglary) {
      // Generate unique number: POL-B-timestamp-random
      const burglaryPolicyNumber = `POL-B-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      
      await prisma.policy.create({
        data: {
          policy_number: burglaryPolicyNumber,
          type: "BURGLARY",
          start_date: new Date(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          userId: user.id,
        },
      });
      console.log(`Created BURGLARY policy ${burglaryPolicyNumber} for user ${user.email}`);
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

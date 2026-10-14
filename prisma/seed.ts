
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create two sample organizations.
  const salon = await prisma.tenant.upsert({
    where: { slug: "abc-salon" },
    update: {},
    create: {
      name: "ABC Salon",
      slug: "abc-salon",
    },
  });

  const clinic = await prisma.tenant.upsert({
    where: { slug: "xyz-clinic" },
    update: {},
    create: {
      name: "XYZ Clinic",
      slug: "xyz-clinic",
    },
  });

  // Create sample users.
  const shahzad = await prisma.user.upsert({
    where: { email: "shahzad@example.com" },
    update: {},
    create: {
      name: "Shahzad Ahmed",
      email: "shahzad@example.com",
    },
  });

  const ayesha = await prisma.user.upsert({
    where: { email: "ayesha@example.com" },
    update: {},
    create: {
      name: "Ayesha Khan",
      email: "ayesha@example.com",
    },
  });

  // A user can belong to multiple organizations
  // with a different role in each organization.
  await prisma.membership.upsert({
    where: {
      userId_tenantId: {
        userId: shahzad.id,
        tenantId: salon.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: shahzad.id,
      tenantId: salon.id,
      role: "ADMIN",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_tenantId: {
        userId: shahzad.id,
        tenantId: clinic.id,
      },
    },
    update: { role:"STAFF" },
    create: {
      userId: shahzad.id,
      tenantId: clinic.id,
      role:"STAFF",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_tenantId: {
        userId: ayesha.id,
        tenantId: clinic.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: ayesha.id,
      tenantId: clinic.id,
      role: "ADMIN",
    },
  });

  // Add one example booking to each organization.
  // Delete existing demo bookings first so rerunning
  // the seed script doesn't create duplicates.
  await prisma.booking.deleteMany({
    where: { tenantId: salon.id },
  });

  await prisma.booking.deleteMany({
    where: { tenantId: clinic.id },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const afternoon = new Date(tomorrow);
  afternoon.setHours(14, 0, 0, 0);

  await prisma.booking.create({
    data: {
      tenantId: salon.id,
      title: "Haircut Appointment",
      clientName: "Ali Raza",
      clientEmail: "ali@example.com",
      startsAt: tomorrow,
      endsAt: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      tenantId: clinic.id,
      title: "General Consultation",
      clientName: "Sara Ahmed",
      clientEmail: "sara@example.com",
      startsAt: afternoon,
      endsAt: new Date(afternoon.getTime() + 30 * 60 * 1000),
      status: "PENDING",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Organizations: ABC Salon, XYZ Clinic");
  console.log("Users: shahzad@example.com, ayesha@example.com");
  console.log("Bookings: 2");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

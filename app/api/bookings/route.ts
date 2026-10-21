
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const createBookingSchema = z.object({
  title: z.string().trim().min(1).max(200),
  clientName: z.string().trim().min(1).max(150),
  clientEmail: z.string().email().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
}).refine(
  (data) => new Date(data.endsAt) > new Date(data.startsAt),
  { message: "End time must be after start time.", path: ["endsAt"] },
);

async function getIdentity() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    throw new ApiError(401, "Please sign in.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(401, "User account not found.");
  }

  return user;
}

async function getTenant(slug: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });

  if (!tenant) {
    throw new ApiError(404, "Workspace not found.");
  }

  return tenant;
}

async function setTenantContext(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string,
) {
  await tx.$queryRaw`
    SELECT set_config('app.current_tenant_id', ${tenantId}, true)
  `;

  const membership = await tx.membership.findUnique({
    where: {
      userId_tenantId: { userId, tenantId },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new ApiError(403, "You do not belong to this workspace.");
  }
}

function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Booking API error:", error);

  return NextResponse.json(
    { error: "An unexpected server error occurred." },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const user = await getIdentity();
    const url = new URL(request.url);
    const slug = url.searchParams.get("tenantSlug")?.trim();

    if (!slug) {
      throw new ApiError(400, "tenantSlug is required.");
    }

    const tenant = await getTenant(slug);

    const bookings = await prisma.$transaction(async (tx) => {
      await setTenantContext(tx, tenant.id, user.id);

      return tx.booking.findMany({
        where: { tenantId: tenant.id },
        orderBy: { startsAt: "asc" },
        take: 200,
      });
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getIdentity();
    const url = new URL(request.url);
    const slug = url.searchParams.get("tenantSlug")?.trim();

    if (!slug) {
      throw new ApiError(400, "tenantSlug is required.");
    }

    const key = request.headers.get("Idempotency-Key")?.trim();

    if (!key || key.length < 8 || key.length > 200) {
      throw new ApiError(
        400,
        "Provide an Idempotency-Key between 8 and 200 characters.",
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Request body must be valid JSON.");
    }

    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid booking data.",
          details: z.treeifyError(parsed.error),
        },
        { status: 400 },
      );
    }

    const tenant = await getTenant(slug);

    const payload = {
      title: parsed.data.title,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail ?? null,
      startsAt: new Date(parsed.data.startsAt).toISOString(),
      endsAt: new Date(parsed.data.endsAt).toISOString(),
    };

    const hash = createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");

    const createOrReplay = async () =>
      prisma.$transaction(async (tx) => {
        await setTenantContext(tx, tenant.id, user.id);

        const existing = await tx.booking.findFirst({
          where: {
            tenantId: tenant.id,
            idempotencyKey: key,
          },
        });

        if (existing) {
          if (existing.idempotencyHash !== hash) {
            throw new ApiError(
              409,
              "This idempotency key was used with different booking data.",
            );
          }

          return { booking: existing, replayed: true };
        }

        const booking = await tx.booking.create({
          data: {
            ...payload,
            tenantId: tenant.id,
            idempotencyKey: key,
            idempotencyHash: hash,
          },
        });

        return { booking, replayed: false };
      });

    try {
      const result = await createOrReplay();

      return NextResponse.json(
        result,
        { status: result.replayed ? 200 : 201 },
      );
    } catch (error) {
      // A concurrent request may have won the unique-key race.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const result = await createOrReplay();

        return NextResponse.json(
          result,
          { status: result.replayed ? 200 : 201 },
        );
      }

      throw error;
    }
  } catch (error) {
    return errorResponse(error);
  }
}


import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  clientName: z.string().trim().min(1).max(150).optional(),
  clientEmail: z.string().email().nullable().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update.",
});

class RouteError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function authorizeTenant(
  tx: Prisma.TransactionClient,
  tenantId: string,
  email: string,
) {
  await tx.$queryRaw`
    SELECT set_config('app.current_tenant_id', ${tenantId}, true)
  `;

  const user = await tx.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) throw new RouteError(401, "User not found.");

  const membership = await tx.membership.findUnique({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new RouteError(403, "Workspace access denied.");
  }
}

function failure(error: unknown) {
  if (error instanceof RouteError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid booking data.", details: z.treeifyError(error) },
      { status: 400 },
    );
  }

  console.error("Booking detail API error:", error);

  return NextResponse.json(
    { error: "An unexpected server error occurred." },
    { status: 500 },
  );
}

type Context = {
  params: Promise<{ id: string }>;
};

async function getContext(request: Request, id: string) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) throw new RouteError(401, "Please sign in.");

  const slug = new URL(request.url).searchParams
    .get("tenantSlug")?.trim();

  if (!slug) throw new RouteError(400, "tenantSlug is required.");

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!tenant) throw new RouteError(404, "Workspace not found.");

  return { email, tenant, id };
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const ctx = await getContext(request, id);

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new RouteError(400, "Request body must be valid JSON.");
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid booking data.",
          details: z.treeifyError(parsed.error),
        },
        { status: 400 },
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      await authorizeTenant(tx, ctx.tenant.id, ctx.email);

      const existing = await tx.booking.findFirst({
        where: { id: ctx.id, tenantId: ctx.tenant.id },
      });

      if (!existing) {
        throw new RouteError(404, "Booking not found.");
      }

      const data = parsed.data;

      const startsAt = data.startsAt
        ? new Date(data.startsAt)
        : existing.startsAt;

      const endsAt = data.endsAt
        ? new Date(data.endsAt)
        : existing.endsAt;

      if (endsAt <= startsAt) {
        throw new RouteError(
          400,
          "End time must be after start time.",
        );
      }

      return tx.booking.update({
        where: { id: existing.id },
        data: {
          ...data,
          startsAt: data.startsAt ? startsAt : undefined,
          endsAt: data.endsAt ? endsAt : undefined,
        },
      });
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const ctx = await getContext(request, id);

    await prisma.$transaction(async (tx) => {
      await authorizeTenant(tx, ctx.tenant.id, ctx.email);

      const existing = await tx.booking.findFirst({
        where: { id: ctx.id, tenantId: ctx.tenant.id },
        select: { id: true },
      });

      if (!existing) {
        throw new RouteError(404, "Booking not found.");
      }

      await tx.booking.delete({ where: { id: existing.id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return failure(error);
  }
}

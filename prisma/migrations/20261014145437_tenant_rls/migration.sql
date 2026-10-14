
-- Enable and force tenant-level security for memberships.
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;

CREATE POLICY "membership_tenant_isolation"
ON "Membership"
USING (
  "tenantId" = current_setting('app.current_tenant_id', true)
)
WITH CHECK (
  "tenantId" = current_setting('app.current_tenant_id', true)
);

-- Enable and force tenant-level security for bookings.
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" FORCE ROW LEVEL SECURITY;

CREATE POLICY "booking_tenant_isolation"
ON "Booking"
USING (
  "tenantId" = current_setting('app.current_tenant_id', true)
)
WITH CHECK (
  "tenantId" = current_setting('app.current_tenant_id', true)
);

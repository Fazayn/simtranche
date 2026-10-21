 
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import BookingDashboard from "@/components/booking-dashboard";

export default async function DashboardPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return <BookingDashboard />;
}

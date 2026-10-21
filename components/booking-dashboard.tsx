
"use client";

import { useCallback, useEffect, useState } from "react";

type Booking = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string | null;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100";

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function BookingDashboard() {
  const [tenantSlug, setTenantSlug] = useState("abc-salon");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(async () => {
    if (!tenantSlug.trim()) {
      setNotice("Enter a workspace slug.");
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      const response = await fetch(
        `/api/bookings?tenantSlug=${encodeURIComponent(tenantSlug.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        setNotice(data.error ?? "Unable to load bookings.");
        return;
      }

      setBookings(data.bookings ?? []);
    } catch {
      setNotice("Could not connect to the server. Check that the app is running.");
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  function resetForm() {
    setTitle("");
    setClientName("");
    setClientEmail("");
    setStartsAt("");
    setEndsAt("");
    setEditingId(null);
  }

  function startEditing(booking: Booking) {
    setEditingId(booking.id);
    setTitle(booking.title);
    setClientName(booking.clientName);
    setClientEmail(booking.clientEmail ?? "");
    setStartsAt(toLocalDateTime(booking.startsAt));
    setEndsAt(toLocalDateTime(booking.endsAt));
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tenantSlug.trim()) {
      setNotice("Enter a workspace slug.");
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      setNotice("End time must be later than start time.");
      return;
    }

    setSaving(true);
    setNotice("");

    const payload = {
      title: title.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    };

    try {
      const url = editingId
        ? `/api/bookings/${encodeURIComponent(editingId)}?tenantSlug=${encodeURIComponent(tenantSlug.trim())}`
        : `/api/bookings?tenantSlug=${encodeURIComponent(tenantSlug.trim())}`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(editingId ? {} : { "Idempotency-Key": crypto.randomUUID() }),
        },
        body: JSON.stringify(payload),
      });

      const data = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        setNotice(data?.error ?? "Unable to save booking.");
        return;
      }

      const wasEditing = Boolean(editingId);
      resetForm();
      setNotice(wasEditing ? "Booking updated successfully." : "Booking created successfully.");
      await loadBookings();
    } catch {
      setNotice("Could not connect to the server. Your changes may not have been saved; refresh before retrying.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBooking(id: string) {
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;

    setNotice("");

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(id)}?tenantSlug=${encodeURIComponent(tenantSlug.trim())}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setNotice(data.error ?? "Unable to delete booking.");
        return;
      }

      setBookings((current) => current.filter((booking) => booking.id !== id));

      if (editingId === id) resetForm();

      setNotice("Booking deleted successfully.");
    } catch {
      setNotice("Could not connect to the server. Refresh the list and check the booking.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Booking management
            </p>
            <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Manage appointments and client bookings.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              aria-label="Workspace slug"
              className={inputClass}
              value={tenantSlug}
              onChange={(event) => setTenantSlug(event.target.value)}
              placeholder="Workspace slug"
            />
            <button
              type="button"
              onClick={() => void loadBookings()}
              disabled={loading}
              className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-60"
            >
              Load
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-gray-200 bg-white p-4 text-sm"
          >
            {notice}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit booking" : "Create booking"}
          </h2>

          <form onSubmit={saveBooking} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium">
              Booking title
              <input
                required
                maxLength={200}
                className={inputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Initial consultation"
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              Client name
              <input
                required
                maxLength={150}
                className={inputClass}
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Client name"
              />
            </label>

            <label className="space-y-1 text-sm font-medium sm:col-span-2">
              Client email (optional)
              <input
                type="email"
                className={inputClass}
                value={clientEmail}
                onChange={(event) => setClientEmail(event.target.value)}
                placeholder="client@example.com"
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              Start date and time
              <input
                required
                type="datetime-local"
                className={inputClass}
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              End date and time
              <input
                required
                type="datetime-local"
                className={inputClass}
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                disabled={saving}
                className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
                type="submit"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create booking"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Bookings</h2>
              <p className="mt-1 text-sm text-gray-500">
                {bookings.length} appointments loaded
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadBookings()}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-gray-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="py-8 text-gray-500">
              No bookings to display yet. Create your first booking above.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold">{booking.title}</h3>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {booking.clientName}
                      {booking.clientEmail ? ` · ${booking.clientEmail}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(booking.startsAt).toLocaleString()} –{" "}
                      {new Date(booking.endsAt).toLocaleString()}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(booking)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteBooking(booking.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


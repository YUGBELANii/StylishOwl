import { requireAdmin } from "@/lib/supabase/admin";
import { saveWhatsAppNumberAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function AdminSettingsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/settings");
  const [{ data: settings, error }, params] = await Promise.all([
    supabase.from("store_settings").select("whatsapp_number").eq("id", "primary").maybeSingle(),
    searchParams,
  ]);
  const whatsappNumber = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p>
          <h1>Store settings.</h1>
          <p>Manage the contact details customers use when placing an order.</p>
        </div>
      </header>
      {params.error && <p className="commerce-error">{params.error}</p>}
      {params.saved && <p className="account-notice">WhatsApp number updated. New checkout requests will use this number.</p>}
      {error ? (
        <p className="commerce-error">Unable to load store settings. Check that the latest database migration has been applied.</p>
      ) : (
        <section className="account-card coupon-create">
          <h2>WhatsApp checkout number</h2>
          <p>Customers will be redirected to this WhatsApp number after submitting checkout. Include your country code, without + or spaces.</p>
          <form action={saveWhatsAppNumberAction} className="auth-form">
            <label>
              WhatsApp number
              <input
                name="whatsapp_number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                minLength={8}
                maxLength={15}
                pattern="[0-9]{8,15}"
                defaultValue={whatsappNumber}
                placeholder="919876543210"
              />
            </label>
            <button type="submit">Save WhatsApp number ↗</button>
          </form>
          <p className="table-subline">Use digits only. Example: 91 followed by your 10-digit mobile number.</p>
        </section>
      )}
    </main>
  );
}

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EKLAS_API_BASE = "https://io.eklas.dev/api/v1";

export async function generateEklasLicense(orderId: string, orderItemId: string, product: any, customerEmail: string) {
  const apiKey = process.env['EKLAS_LICENSE_API_KEY'];
...
  const apiKey = process.env['EKLAS_LICENSE_API_KEY'];
  if (!apiKey) return { ok: false, message: "API Key not configured" };

  try {
    // There isn't a dedicated health check mentioned, so we might try a minimal call or just check config
    // For now, we'll assume if the key is present it's 'Configured'
    return { ok: true, message: "Provider configured" };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

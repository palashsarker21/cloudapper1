import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EKLAS_API_BASE = "https://io.eklas.dev/api/v1";

export async function generateEklasLicense(orderId: string, orderItemId: string, product: any, customerEmail: string) {
  const apiKey = process.env['EKLAS_LICENSE_API_KEY'];
  if (!apiKey) {
    throw new Error("CONFIGURATION_MISSING: EKLAS_LICENSE_API_KEY is not configured.");
  }

  const durationValue = product.license_duration || 1;
  const durationUnit = "day"; 
  const plan = "Pro"; 
  const maxActivations = product.device_limit || 5;

  console.log(`[Eklas] Generating license for order ${orderId}, product ${product.name}`);

  try {
    const response = await fetch(`${EKLAS_API_BASE}/license/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        plan,
        email: customerEmail,
        durationValue,
        durationUnit,
        maxActivations
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eklas API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.ok || !data.license_key) {
      throw new Error("Invalid response from Eklas: Missing license_key");
    }

    const licenseKey = data.license_key;
    const last4 = licenseKey.slice(-4);
    
    const { data: license, error: licenseError } = await (supabaseAdmin
      .from('licenses' as any)
      .insert({
        order_id: orderId,
        order_item_id: orderItemId,
        product_id: product.id,
        customer_id: product.customer_id,
        provider: 'eklas',
        provider_license_id: data.provider_license_id,
        license_key_encrypted: licenseKey,
        license_key_last4: last4,
        plan: data.plan || plan,
        duration_value: durationValue,
        duration_unit: durationUnit,
        max_activations: maxActivations,
        expires_at: data.expires_at,
        metadata: {
          eklas_response: {
            duration_minutes: data.duration_minutes,
            expires_at: data.expires_at
          }
        }
      })
      .select()
      .single() as any);

    if (licenseError) throw licenseError;

    await supabaseAdmin.from('entitlements' as any).insert({
      user_id: product.customer_id,
      product_id: product.id,
      order_id: orderId,
      fulfillment_id: product.fulfillment_id,
      type: 'license',
      data: {
        license_id: license.id,
        license_key_last4: last4,
        plan: data.plan || plan,
        expires_at: data.expires_at,
        instructions: product.delivery_instructions
      }
    });

    return license;

  } catch (err: any) {
    console.error(`[Eklas] Fulfillment failed:`, err);
    throw err;
  }
}

export async function testEklasConnection() {
  const apiKey = process.env['EKLAS_LICENSE_API_KEY'];
  if (!apiKey) return { ok: false, message: "API Key not configured" };

  try {
    return { ok: true, message: "Provider configured" };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

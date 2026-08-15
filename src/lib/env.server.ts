import { createServerFn } from "@tanstack/react-start";

export const REQUIRED_CORE = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export const OPTIONAL_PAYMENT = [
  'BINANCE_PAY_API_KEY',
  'BINANCE_PAY_SECRET_KEY',
  'BINANCE_PAY_MERCHANT_ID',
  'BINANCE_PAY_WEBHOOK_SECRET',
] as const;

export const OPTIONAL_FULFILLMENT = [
  'EKLAS_LICENSE_API_KEY',
] as const;

export const OPTIONAL_EMAIL = [
  'EMAIL_PROVIDER_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
] as const;

export type EnvKey = 
  | typeof REQUIRED_CORE[number] 
  | typeof OPTIONAL_PAYMENT[number] 
  | typeof OPTIONAL_FULFILLMENT[number]
  | typeof OPTIONAL_EMAIL[number];

/**
 * Safely check if a service is configured without exposing values
 */
export function isServiceConfigured(service: 'binance' | 'eklas' | 'email'): boolean {
  const keys = {
    binance: BINANCE_PAY_API_KEY,
    eklas: OPTIONAL_FULFILLMENT,
    email: ['EMAIL_PROVIDER_API_KEY'] as const, // Minimum required
  };

  if (service === 'binance') {
    return OPTIONAL_PAYMENT.every(key => !!process.env[key]);
  }
  if (service === 'eklas') {
    return OPTIONAL_FULFILLMENT.every(key => !!process.env[key]);
  }
  if (service === 'email') {
    return !!process.env['EMAIL_PROVIDER_API_KEY'] || (!!process.env['SMTP_HOST'] && !!process.env['SMTP_USER']);
  }
  
  return false;
}

export function getSafeEnvStatus() {
  return {
    supabase: {
      url: !!process.env['VITE_SUPABASE_URL'],
      anonKey: !!process.env['VITE_SUPABASE_ANON_KEY'],
      serviceRole: !!process.env['SUPABASE_SERVICE_ROLE_KEY'],
    },
    binance: {
      configured: isServiceConfigured('binance'),
      missing: OPTIONAL_PAYMENT.filter(key => !process.env[key]),
    },
    eklas: {
      configured: isServiceConfigured('eklas'),
      missing: OPTIONAL_FULFILLMENT.filter(key => !process.env[key]),
    },
    email: {
      configured: isServiceConfigured('email'),
      type: process.env['EMAIL_PROVIDER_API_KEY'] ? 'API' : (process.env['SMTP_HOST'] ? 'SMTP' : 'None'),
    }
  };
}

export const getSystemHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    // This is server-only, so we can check env vars safely
    return getSafeEnvStatus();
  });

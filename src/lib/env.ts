const requiredPublicVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const requiredServerVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
] as const;

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Add it to your .env.local file. See .env.local.example for reference.`,
    );
  }
  return value;
}

export function getPublicEnvVar(key: (typeof requiredPublicVars)[number]): string {
  return getEnvVar(key);
}

export function getServerEnvVar(key: (typeof requiredServerVars)[number]): string {
  if (typeof window !== "undefined") {
    throw new Error(
      `Server-only environment variable "${key}" was accessed on the client. ` +
        "This is a security risk. Use NEXT_PUBLIC_ prefix for client-safe values.",
    );
  }
  return getEnvVar(key);
}

export function validateEnv(): void {
  for (const key of requiredPublicVars) {
    getPublicEnvVar(key);
  }
  if (typeof window === "undefined") {
    for (const key of requiredServerVars) {
      getServerEnvVar(key);
    }
  }
}

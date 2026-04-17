import "server-only";

const readEnv = (key: string): string => process.env[key] ?? "";

const requireEnv = (key: string): string => {
  const value = readEnv(key);
  if (!value) throw new Error(`[CRITICAL] Missing required env var: ${key}`);
  return value;
};

const configApi = {
  runtime: {
    get nodeEnv() {
      return readEnv("NODE_ENV") || "development";
    },
    get isDevelopment() {
      return configApi.runtime.nodeEnv === "development";
    },
  },
  nextAuth: {
    get url() {
      return readEnv("NEXTAUTH_URL") || "http://localhost:3000";
    },
    get secret() {
      return requireEnv("NEXTAUTH_SECRET");
    },
  },
  auth: {
    get callbackUrl() {
      return readEnv("NEXT_PUBLIC_AUTH_CALLBACK_URL") || "/dashboard";
    },
  },
  mongodb: {
    get uri() {
      return requireEnv("MONGODB_URI");
    },
  },
  stripe: {
    get secretKey() {
      return requireEnv("STRIPE_SECRET_KEY");
    },
    get webhookSecret() {
      return requireEnv("STRIPE_WEBHOOK_SECRET");
    },
  },
  resend: {
    get apiKey() {
      return requireEnv("RESEND_API_KEY");
    },
  },
  ai: {
    get openai() {
      return readEnv("OPENAI_API_KEY");
    },
    get claude() {
      return readEnv("CLAUDE_API_KEY");
    },
  },
  oauth: {
    google: {
      get id() {
        return readEnv("GOOGLE_ID");
      },
      get secret() {
        return readEnv("GOOGLE_SECRET");
      },
    },
    github: {
      get id() {
        return readEnv("GITHUB_ID");
      },
      get secret() {
        return readEnv("GITHUB_SECRET");
      },
    },
    linkedin: {
      get id() {
        return readEnv("LINKEDIN_ID");
      },
      get secret() {
        return readEnv("LINKEDIN_SECRET");
      },
    },
    facebook: {
      get id() {
        return readEnv("FACEBOOK_ID");
      },
      get secret() {
        return readEnv("FACEBOOK_SECRET");
      },
    },
  },
} as const;

export default configApi;
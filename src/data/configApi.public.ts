const readPublicEnv = (key: string): string => process.env[key] ?? "";

const configApiPublic = {
  auth: {
    get callbackUrl() {
      return readPublicEnv("NEXT_PUBLIC_AUTH_CALLBACK_URL") || "/dashboard";
    },
  },
  analytics: {
    get googleAnalyticsId() {
      return readPublicEnv("NEXT_PUBLIC_GA_ID");
    },
    get clarityId() {
      return readPublicEnv("NEXT_PUBLIC_CLARITY_ID");
    },
  },
} as const;

export default configApiPublic;
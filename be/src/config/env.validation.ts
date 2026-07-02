type Environment = Record<string, string | undefined>;

type AppEnvironment = {
  PORT?: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  MAIL_FROM?: string;
  SUPABASE_PRODUCT_IMAGES_BUCKET?: string;
  SUPABASE_PAYMENT_QR_BUCKET?: string;
  FRONTEND_URL?: string;
  VNPAY_TMN_CODE?: string;
  VNPAY_HASH_SECRET?: string;
  VNPAY_PAYMENT_URL?: string;
  VNPAY_RETURN_URL?: string;
  VNPAY_IPN_URL?: string;
  MOMO_PARTNER_CODE?: string;
  MOMO_ACCESS_KEY?: string;
  MOMO_SECRET_KEY?: string;
  MOMO_ENDPOINT?: string;
  MOMO_REDIRECT_URL?: string;
  MOMO_IPN_URL?: string;
};

const requiredKeys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateEnv(config: Environment): AppEnvironment {
  const missingKeys = requiredKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(', ')}`);
  }

  return {
    PORT: config.PORT,
    SUPABASE_URL: config.SUPABASE_URL as string,
    SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY as string,
    SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY as string,
    SMTP_HOST: config.SMTP_HOST,
    SMTP_PORT: config.SMTP_PORT,
    SMTP_USER: config.SMTP_USER,
    SMTP_PASS: config.SMTP_PASS,
    MAIL_FROM: config.MAIL_FROM,
    SUPABASE_PRODUCT_IMAGES_BUCKET: config.SUPABASE_PRODUCT_IMAGES_BUCKET,
    SUPABASE_PAYMENT_QR_BUCKET: config.SUPABASE_PAYMENT_QR_BUCKET,
    FRONTEND_URL: config.FRONTEND_URL,
    VNPAY_TMN_CODE: config.VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET: config.VNPAY_HASH_SECRET,
    VNPAY_PAYMENT_URL: config.VNPAY_PAYMENT_URL,
    VNPAY_RETURN_URL: config.VNPAY_RETURN_URL,
    VNPAY_IPN_URL: config.VNPAY_IPN_URL,
    MOMO_PARTNER_CODE: config.MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY: config.MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY: config.MOMO_SECRET_KEY,
    MOMO_ENDPOINT: config.MOMO_ENDPOINT,
    MOMO_REDIRECT_URL: config.MOMO_REDIRECT_URL,
    MOMO_IPN_URL: config.MOMO_IPN_URL,
  };
}

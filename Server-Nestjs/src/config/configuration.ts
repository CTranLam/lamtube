const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

export default () => ({
  app: {
    port: parseNumber(process.env.PORT ?? process.env.NEST_PORT, 3000),
    corsOrigins: parseList(requireEnv('WS_CORS_ORIGINS')),
  },
  auth: {
    jwtSecret: requireEnv('APP_JWT_SECRET_KEY'),
  },
  database: {
    mongodbUri: requireEnv('MONGODB_URI'),
  },
  rabbitmq: {
    url: requireEnv('RABBITMQ_URL'),
    exchange: requireEnv('RABBITMQ_EXCHANGE'),
    queue: requireEnv('RABBITMQ_QUEUE'),
    deadLetterQueue: requireEnv('RABBITMQ_DLQ'),
  },
});

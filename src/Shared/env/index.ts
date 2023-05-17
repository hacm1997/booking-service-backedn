import dotenv from 'dotenv';

dotenv.config(
  { path: `${process.env.NODE_ENV ?? 'production'}.env` }
);

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  dynamodb: {
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_DYNAMODB_ENDPOINT,
    apiVersion: process.env.AWS_DYNAMODB_API_VERSION,
    tableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    accessKeyId: process.env.AWS_DYNAMODB_CREDENTIALS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_DYNAMODB_CREDENTIALS_SECRET_ACCESS
  },
  opensearch: {
    region: process.env.AWS_OPENSEARCH_CREDENTIALS_REGION,
    endpoint: process.env.AWS_OPENSEARCH_ENDPOINT,
    index: process.env.OPENSEARCH_INDEX_NAME
  },
  frontend_urls: [...new Set(process.env.FRONTEND_URLS?.split(',') ?? [])],
  microsoft: {
    MICROSOFT_CLIENT: process.env.MICROSOFT_CLIENT,
    MICROSOFT_SECRET: process.env.MICROSOFT_SECRET,
    MICROSOFT_TENANT: process.env.MICROSOFT_TENANT
  }
};

if (env.NODE_ENV === 'development') {
  console.log('env:',
    JSON.stringify(env, null, 2)
  );
}

export default env;

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    REPLICATE_API_KEY?: string;
    ELEVENLABS_API_KEY?: string;
    DATABASE_URL?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    S3_BUCKET_NAME?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

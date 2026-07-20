
export const env = {
  /** Gemini API Key for AI features */
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY as string || '',

  /** Backend API base URL */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:3000',

  /** Current environment mode */
  MODE: import.meta.env.MODE as string,

  
  IS_DEV: import.meta.env.DEV,

  /** Whether we're in production mode */
  IS_PROD: import.meta.env.PROD,
} as const;

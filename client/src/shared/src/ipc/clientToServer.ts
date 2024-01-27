import { z } from 'zod';

const Example1Request = z.object({
  param1: z.string(),
});

const Example1Response = z.object({
  result: z.string(),
});

const Example2Request = z.object({
  value: z.number(),
});

const Example2Response = z.object({
  total: z.number(),
});

// Define the API using Zod schemas directly
export const apiSchemas = {
  'ipc-example1': {
    request: Example1Request,
    response: Example1Response,
  },
  'ipc-example2': {
    request: Example2Request,
    response: Example2Response,
  },
};

// Infer types from Zod schemas
export type Api = {
  [K in keyof typeof apiSchemas]: {
    request: z.infer<typeof apiSchemas[K]['request']>;
    response: z.infer<typeof apiSchemas[K]['response']>;
  };
};

// Define Channels type for preload.ts
export type ChannelsClientToServer = keyof Api;

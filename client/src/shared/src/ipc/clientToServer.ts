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

// Define the API using Zod schemas
export interface Api {
  'ipc-example1': {
    request: z.infer<typeof Example1Request>;
    response: z.infer<typeof Example1Response>;
  };
  'ipc-example2': {
    request: z.infer<typeof Example2Request>;
    response: z.infer<typeof Example2Response>;
  };
}

// Define Channels type for preload.ts
export type ChannelsClientToServer = keyof Api;

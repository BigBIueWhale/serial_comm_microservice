import { z } from 'zod';
import { SerialPortHandle } from './clientToServer';

export const SerialDataReceivedNotification = z.object({
  handle: SerialPortHandle,
  data: z.instanceof(Uint8Array),
});

export const SerialErrorNotification = z.object({
  handle: SerialPortHandle,
  error: z.string(),
});

// Define the API using Zod schemas
export const apiSchemasServerToClient = {
  'notify-serialDataReceived': {
    notification: SerialDataReceivedNotification,
  },
  'notify-serialError': {
    notification: SerialErrorNotification,
  },
};

// Infer types from Zod schemas
export type ApiServerToClient = {
  [K in keyof typeof apiSchemasServerToClient]: {
    notification: z.infer<typeof apiSchemasServerToClient[K]['notification']>;
  };
};

// Define Channels type for preload.ts
export type ChannelsServerToClient = keyof ApiServerToClient;

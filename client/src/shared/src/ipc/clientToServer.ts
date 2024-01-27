import { z } from 'zod';

// Define Zod schemas for each API call
const ListSerialPortsRequest = z.object({});

const ListSerialPortsResponse = z.string();

const OpenPortRequest = z.object({
  port: z.string(),
  settings: z.object({
    baudRate: z.number(),
    // Add other serial port settings here as needed
  }),
});

const OpenPortResponse = z.number();

const ClosePortRequest = z.object({
  handle: z.number(),
});

const ClosePortResponse = z.void();

const StartReadingRequest = z.object({
  handle: z.number(),
});

const StartReadingResponse = z.void();

const StopReadingRequest = z.object({
  handle: z.number(),
});

const StopReadingResponse = z.void();

const WriteRequest = z.object({
  handle: z.number(),
  data: z.instanceof(Uint8Array),
});

const WriteResponse = z.void();

const ReadRequest = z.object({
  handle: z.number(),
  timeout: z.number(),
});

const ReadResponse = z.instanceof(Uint8Array);

// Define the API using Zod schemas
export const apiSchemas = {
  'ipc-listSerialPorts': {
    request: ListSerialPortsRequest,
    response: ListSerialPortsResponse,
  },
  'ipc-openPort': {
    request: OpenPortRequest,
    response: OpenPortResponse,
  },
  'ipc-closePort': {
    request: ClosePortRequest,
    response: ClosePortResponse,
  },
  'ipc-startReading': {
    request: StartReadingRequest,
    response: StartReadingResponse,
  },
  'ipc-stopReading': {
    request: StopReadingRequest,
    response: StopReadingResponse,
  },
  'ipc-write': {
    request: WriteRequest,
    response: WriteResponse,
  },
  'ipc-read': {
    request: ReadRequest,
    response: ReadResponse,
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

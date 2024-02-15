import { z } from 'zod';

// Define Zod schemas for each API call
export const ListSerialPortsRequest = z.object({});

export const ListSerialPortsResponse = z.array(z.string());

export const SerialPortHandle = z.string();
export const SERIAL_PORT_HANDLE_UNINITIALIZED: z.infer<typeof SerialPortHandle> = "";

export const OpenPortRequest = z.object({
  port: z.string(),
  settings: z.object({
    baudRate: z.number().int().positive(),
    // Add other serial port settings here as needed
  }),
});

export const OpenPortResponse = SerialPortHandle;

export const ClosePortRequest = z.object({
  handle: SerialPortHandle,
});

export const ClosePortResponse = z.void();

export const StartReadingRequest = z.object({
  handle: SerialPortHandle,
});

export const StartReadingResponse = z.void();

export const StopReadingRequest = z.object({
  handle: SerialPortHandle,
});

export const StopReadingResponse = z.void();

export const WriteRequest = z.object({
  handle: SerialPortHandle,
  data: z.instanceof(Uint8Array),
});

export const WriteResponse = z.void();

export const ReadRequest = z.object({
  handle: SerialPortHandle,
  // Value 0 is return immediately,
  // super high value will wait forever (for all intents and purposes).
  timeoutNanoseconds: z.number().int().nonnegative(),
});

export const ReadResponse = z.instanceof(Uint8Array);

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
export type ApiClientToServer = {
  [K in keyof typeof apiSchemas]: {
    request: z.infer<typeof apiSchemas[K]['request']>;
    response: z.infer<typeof apiSchemas[K]['response']>;
  };
};

// Define Channels type for preload.ts
export type ChannelsClientToServer = keyof ApiClientToServer;

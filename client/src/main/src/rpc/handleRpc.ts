// Use typescript magic to generate a statically-typed
// function that'll be used by `main` to register
// a handler that'll be triggered when the `renderer` uses
// .invokeRpc with the specified channel name string.

import { ApiClientToServer, apiSchemas } from '../../../shared/src/ipc/clientToServer';
import superjson from "superjson";
import { ipcMain } from 'electron';

export function handleRpc<K extends keyof ApiClientToServer>(
    channel: K,
    handler: (arg: ApiClientToServer[K]['request']) => Promise<ApiClientToServer[K]['response']>
  ) {
    ipcMain.handle(channel, async (_, arg) => {
      const deserializedArg = superjson.parse(arg);

      // Validate the request using Zod schema
      const validatedArg = apiSchemas[channel].request.parse(deserializedArg);

      const result = await handler(validatedArg);

      // Validate the response before sending it back
      const validatedResult = apiSchemas[channel].response.parse(result);

      return superjson.stringify(validatedResult);
    });
  }

export function removeHandler<K extends keyof ApiClientToServer>(
    channel: K,
  ) {
    ipcMain.removeHandler(channel);
  }

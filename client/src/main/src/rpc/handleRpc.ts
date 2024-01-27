// Use typescript magic to generate a statically-typed
// function that'll be used by `main` to register
// a handler that'll be triggered when the `renderer` uses
// .invokeRpc with the specified channel name string.

import { Api, apiSchemas } from "shared/src/ipc/clientToServer";
import superjson from 'superjson';
import { ipcMain } from 'electron';

export async function handleRpc<K extends keyof Api>(
    channel: K,
    handler: (arg: Api[K]['request']) => Promise<Api[K]['response']>
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

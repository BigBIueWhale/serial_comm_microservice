// Use typescript magic to generate a statically-typed
// function that'll be used by `renderer` to invoke any
// of the available RPC functionalities that the server offers.

import { ApiClientToServer, apiSchemas } from "shared/src/ipc/clientToServer";
import superjson from 'superjson';

export async function invokeRpc<K extends keyof ApiClientToServer>(
    channel: K,
    arg: ApiClientToServer[K]['request']
  ): Promise<ApiClientToServer[K]['response']> {
    // Validate the request using Zod schema
    const validatedArg = apiSchemas[channel].request.parse(arg);

    // The invoke function is defined in preload.ts
    const result = await window.electron.ipcRenderer.invoke(channel, superjson.stringify(validatedArg));
    const parsedResult = superjson.parse(result);

    // Validate the response using Zod schema
    return apiSchemas[channel].response.parse(parsedResult);
  }

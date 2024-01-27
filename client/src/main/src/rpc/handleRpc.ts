// Use typescript magic to generate a statically-typed
// function that'll be used by `main` to register
// a handler that'll be triggered when the `renderer` uses

import { Api } from "shared/src/ipc/clientToServer";
import superjson from 'superjson';
import { ipcMain } from 'electron';

// .invokeRpc with the specified channel name string.
export async function handleRpc<K extends keyof Api>(
    channel: K,
    handler: (arg: Api[K]['request']) => Promise<Api[K]['response']>
  ) {
    ipcMain.handle(channel, async (_, arg) => {
      const deserializedArg = superjson.parse(arg);
      const result = await handler(deserializedArg as Api[K]['request']);
      return superjson.stringify(result);
    });
  }

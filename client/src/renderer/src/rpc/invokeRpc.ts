// Use typescript magic to generate a statically-typed
// function that'll be used by `renderer` to invoke any

import { Api } from "shared/src/ipc/clientToServer";
import superjson from 'superjson';

// of the available RPC functionalities that the server offers.
export async function invokeRpc<K extends keyof Api>(
    channel: K,
    arg: Api[K]['request']
  ): Promise<Api[K]['response']> {
    const result = await window.electron.ipcRenderer.invoke(channel, superjson.stringify(arg));
    return superjson.parse(result);
  }
  
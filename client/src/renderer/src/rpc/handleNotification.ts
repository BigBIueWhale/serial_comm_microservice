// Handle push nofitications from 'main'
// /src/renderer/src/rpc/handleRpc.ts

import { ApiServerToClient, apiSchemasServerToClient } from "shared/src/ipc/serverToClient";
import superjson from 'superjson';

// I'm allowed to create a global variable here, because we're in the front-end
// and every web page has only one server.
// This global map is required, to translate from the API of a handler taking
// a (Electron.IpcRendererEvent, ApiServerToClient[K]['notification']) => void
// whereas I want users to only require (ApiServerToClient[K]['notification']) => void
// At the same time, I need the .off to work as well, so keeping track of
// the function handler objects is necessary. Meaning I can't just convert the API (function signature)
// to another API with a closure, because then a new closure object will be created each time
// and that means the the .offNotification won't work.
//
// Therefore, in order to actually have a translation to my desired function signature I need to
// keep a map of 
const g_notificationHandlers = {
    // TODO: Should contain a map of "eventemitter3"
}

export function onNotification<K extends keyof ApiServerToClient>(
    channel: K,
    handler: (notification: ApiServerToClient[K]['notification']) => void
  ) {
    window.electron.ipcRenderer.onNotification(channel, (_, notification) => {
      const parsedNotification = superjson.parse(notification);
      handler(apiSchemasServerToClient[channel].notification.parse(parsedNotification));
    });
  }

  export function offNotification<K extends keyof ApiServerToClient>(
    channel: K,
    handler: (notification: ApiServerToClient[K]['notification']) => void
  ) {
    window.electron.ipcRenderer.offNotification(channel, (_, notification) => {
      const parsedNotification = superjson.parse(notification);
      handler(apiSchemasServerToClient[channel].notification.parse(parsedNotification));
    });
  }
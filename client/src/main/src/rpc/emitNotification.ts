import { BrowserWindow, ipcMain } from 'electron';
import { ApiServerToClient, apiSchemasServerToClient } from '../../../shared/src/ipc/serverToClient';
import superjson from 'superjson';

export function emitNotification<K extends keyof ApiServerToClient>(
    window: BrowserWindow,
    channel: K,
    notification: ApiServerToClient[K]['notification']
  ) {
    const serializedNotification = superjson.stringify(apiSchemasServerToClient[channel].notification.parse(notification));
    window.webContents.send(channel, serializedNotification);
  }

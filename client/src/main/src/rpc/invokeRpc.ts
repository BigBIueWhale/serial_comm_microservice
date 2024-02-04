import { ipcMain } from 'electron';
import { ApiServerToClient, apiSchemasServerToClient } from '../../../shared/src/ipc/serverToClient';
import superjson from 'superjson';

export function invokeRpc<K extends keyof ApiServerToClient>(
    channel: K,
    notification: ApiServerToClient[K]['notification']
  ) {
    const serializedNotification = superjson.stringify(apiSchemasServerToClient[channel].notification.parse(notification));
    ipcMain.emit(channel, serializedNotification);
  }

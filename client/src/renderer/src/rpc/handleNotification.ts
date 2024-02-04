import { ApiServerToClient, apiSchemasServerToClient } from "shared/src/ipc/serverToClient";
import superjson from 'superjson';
import { EventEmitter } from 'eventemitter3'

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
// keep a map of EventEmitters, and only call the Electron.IPC .onNotification once
// for each channel.


// Helper type to create a strongly-typed EventEmitter for notification types
type TypedEventEmitter<T> = EventEmitter<'notification', T>;

// Utility function to create a map of EventEmitters for each notification type
function createNotificationEventEmitters(): { [K in keyof ApiServerToClient]: TypedEventEmitter<ApiServerToClient[K]['notification']> | null } {
    const channels = Object.keys(apiSchemasServerToClient) as Array<keyof ApiServerToClient>;
    // Initialize all of the event emitters to null, but create all of the
    // possible keys in a one-liner here, to keep the KVP object statically typed.
    const eventEmitters = channels.reduce((accum, channel) => {
        accum[channel] = null;
        return accum;
    }, {} as { [K in keyof ApiServerToClient]: TypedEventEmitter<ApiServerToClient[K]['notification']> | null });
    return eventEmitters;
}

// Create the map of EventEmitters
const g_notificationEventEmitters = createNotificationEventEmitters();


export function onNotification<K extends keyof ApiServerToClient>(
    channel: K,
    handler: (notification: ApiServerToClient[K]['notification']) => void
  ) {
    if (g_notificationEventEmitters[channel] === null) {
        const newEventEmitter: TypedEventEmitter<ApiServerToClient[K]['notification']> = new EventEmitter();
        g_notificationEventEmitters[channel] = newEventEmitter;
        const validator = apiSchemasServerToClient[channel].notification;

        // Subscribe only once per element in this map: g_notificationEventEmitters
        // This also means that I never need to call ipcRenderer.off.
        // Because no matter how many subscribers I have to a specific channel,
        // it all points to a single subscription owned by a value in
        // the map: g_notificationEventEmitters.
        window.electron.ipcRenderer.onNotification(channel, (_, notification) => {
            const parsedNotification = superjson.parse(notification);
            newEventEmitter.emit('notification', validator.parse(parsedNotification));
          });
    }
    const existingEventEmitter = g_notificationEventEmitters[channel];
    if (existingEventEmitter !== null) {
        existingEventEmitter.on('notification', handler);
    }
  }

  export function offNotification<K extends keyof ApiServerToClient>(
    channel: K,
    handler: (notification: ApiServerToClient[K]['notification']) => void
  ) {
    const existingEventEmitter = g_notificationEventEmitters[channel];
    if (existingEventEmitter !== null) {
        existingEventEmitter.off('notification', handler);
    }
  }

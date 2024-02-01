// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { ChannelsClientToServer } from 'shared/src/ipc/clientToServer';

const electronHandler = {
  ipcRenderer: {
    invoke(channel: ChannelsClientToServer, arg: string): Promise<string> {
      return ipcRenderer.invoke(channel, arg);
    },
    // TODO: Create an "on" function here that allows the 'renderer' to handle
    // events invoked by 'main'.
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { ChannelsClientToServer } from 'shared/src/ipc/clientToServer';

const electronHandler = {
  ipcRenderer: {
    invoke(channel: ChannelsClientToServer, arg: string): Promise<string> {
      return ipcRenderer.invoke(channel, arg);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

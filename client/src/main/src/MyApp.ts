import { ipcMain } from 'electron';

export class MyApp {
    constructor(
        private stateOne: number = 0,
        private stateTwo: boolean = false,
    ) {}

    public setupEventHandlers(): void {
        ipcMain.handle('ipc-example1', async (event: Electron.IpcMainInvokeEvent, arg1: string) => {
            const ret = `Response to ${arg1}: ${this.stateOne}, ${this.stateTwo}`;
            this.stateOne += 1;
            this.stateTwo = !this.stateTwo;
            return ret;
        });
    }

    public onAppClosing(): void {
        ipcMain.removeHandler('ipc-example1');
        // Close any resources here
    }
}

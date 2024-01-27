import { ipcMain, IpcMainEvent } from 'electron';

export class MyApp {
    private stateOne: string;
    private stateTwo: number;
    private stateThree: boolean;

    constructor() {
        this.stateOne = 'initial state one';
        this.stateTwo = 0;
        this.stateThree = false;
    }

    public setupEventHandlers(): void {
        ipcMain.on('ipc-example1', this.handleExampleEvent1);
        ipcMain.on('ipc-example2', this.handleExampleEvent2);
    }

    public removeEventHandlers(): void {
        ipcMain.off('ipc-example1', this.handleExampleEvent1);
        ipcMain.off('ipc-example2', this.handleExampleEvent2);
    }

    private async handleExampleEvent1(event: IpcMainEvent, arg: any): Promise<void> {
        console.log(`Received ipc-example1 with arg: ${arg}`);
        this.stateOne = `updated by example1: ${arg}`;
        this.stateTwo += 1;
        event.reply('ipc-example1-response', `StateOne: ${this.stateOne}`);
    }

    private async handleExampleEvent2(event: IpcMainEvent, arg: any): Promise<void> {
        console.log(`Received ipc-example2 with arg: ${arg}`);
        this.stateThree = !this.stateThree;
        this.stateTwo -= 1;
        event.reply('ipc-example2-response', `StateThree: ${this.stateThree}`);
    }
}

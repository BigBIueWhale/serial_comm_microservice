import { handleRpc } from "./rpc/handleRpc";
import { sleepNodejs } from "./utils/sleep.util";

export class MyApp {
    constructor(
        private exampleStateOne: number = 0,
        private exampleStateTwo: boolean = false,
    ) {}

    // I the meantime I've implemented dummy handlers.
    // TODO: Call the Rust gRPC microservice to perform actual serial communication.
    public setupEventHandlers(): void {
        handleRpc('ipc-listSerialPorts', async () => {
            await sleepNodejs(2000);
            return ["COM3", "COM4"];
        });

        handleRpc('ipc-openPort', async (request) => {
            await sleepNodejs(1000);
            // Mock a handle ID
            return Math.floor(Math.random() * 1000);
        });

        handleRpc('ipc-closePort', async (request) => {
            await sleepNodejs(500);
            // No response needed for close operation
        });

        handleRpc('ipc-startReading', async (request) => {
            await sleepNodejs(500);
            // No response needed for start reading
        });

        handleRpc('ipc-stopReading', async (request) => {
            await sleepNodejs(500);
            // No response needed for stop reading
        });

        handleRpc('ipc-write', async (request) => {
            await sleepNodejs(500);
            // No response needed for write operation
        });

        handleRpc('ipc-read', async (request) => {
            await sleepNodejs(1000);
            // Return a dummy Uint8Array
            return new Uint8Array([0, 1, 2, 3, 4, 5]);
        });
    }

    public onAppClosing(): void {
        // Close any resources here
    }
}

import { SERIAL_PORT_HANDLE_UNINITIALIZED } from "shared/src/ipc/clientToServer";
import { handleRpc } from "./rpc/handleRpc";
import { sleepNodejs } from "./utils/sleep.util";
import { v4 as uuidv4 } from 'uuid';

type Handle = {
    isReading: boolean;
};

export class MyApp {
    constructor(
        private mock_handles: Map<string, Handle>
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
            const mock_handle_id = uuidv4();
            this.mock_handles.set(mock_handle_id, { isReading: false });
            return mock_handle_id;
        });

        handleRpc('ipc-closePort', async (request) => {
            await sleepNodejs(500);
            if (request.handle === SERIAL_PORT_HANDLE_UNINITIALIZED) {
                return; // Same as "delete nullptr" which is a valid statement.
            }
            if (this.mock_handles.delete(request.handle) === false) {
                throw new Error(`Tried to close invalid handle: ${request.handle}`);
            }
            // No response needed for close operation
        });

        handleRpc('ipc-startReading', async (request) => {
            await sleepNodejs(500);
            const val = this.mock_handles.get(request.handle);
            if (val === undefined) {
                throw new Error(`Tried to start reading from invalid handle: ${request.handle}`);
            }
            if (val.isReading === true) {
                throw new Error(`Tried to start reading more than once without calling stopReading. Handle: ${request.handle}`);
            }
            // TODO: Send the front-end via .emit a bunch of data every so often
            // until they call ipc-stopReading. That will be to test the the IPC
            // communication between main and renderer works correctly, both ways.
            val.isReading = true;
            // No response needed for start reading
        });

        handleRpc('ipc-stopReading', async (request) => {
            await sleepNodejs(500);
            const val = this.mock_handles.get(request.handle);
            if (val === undefined) {
                throw new Error(`Tried to stop reading from invalid handle: ${request.handle}`);
            }
            if (val.isReading === false) {
                throw new Error(`Tried to stop reading even though we weren't reading. Handle: ${request.handle}`);
            }
            val.isReading = false;
            // No response needed for stop reading
        });

        handleRpc('ipc-write', async (request) => {
            await sleepNodejs(500);
            if (!this.mock_handles.has(request.handle)) {
                throw new Error(`Tried to write to invalid handle: ${request.handle}`);
            }
            // No response needed for write operation
        });

        handleRpc('ipc-read', async (request) => {
            await sleepNodejs(1000);
            if (!this.mock_handles.has(request.handle)) {
                throw new Error(`Tried to read from invalid handle: ${request.handle}`);
            }
            // Return a dummy Uint8Array
            return new Uint8Array([0, 1, 2, 3, 4, 5]);
        });
    }

    public onAppClosing(): void {
        // Close any resources here
    }
}

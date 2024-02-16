import { SERIAL_PORT_HANDLE_UNINITIALIZED } from "shared/src/ipc/clientToServer";
import { handleRpc } from "./rpc/handleRpc";
import { sleepNodejs } from "./utils/sleep.util";
import { v4 as uuidv4 } from 'uuid';

// This is mock state management for a handle.
// When using the real Rust implementation, the state behind
// the handle will be opaque to this Node.JS code.
type Handle = {
    read_interval_id: NodeJS.Timeout | null;
};

export class MyApp {
    constructor(
        private mock_handles: Map<string, Handle>
    ) {}

    // I the meantime I've implemented dummy handlers.
    // TODO: Call the Rust gRPC microservice to perform actual serial communication.
    public setupEventHandlers(): void {
        handleRpc('ipc-listSerialPorts', async () => {
            await sleepNodejs(2_000);
            return ["COM3", "COM4"];
        });

        handleRpc('ipc-openPort', async (request) => {
            await sleepNodejs(1_000);
            // Mock a handle ID
            const mock_handle_id = uuidv4();
            this.mock_handles.set(mock_handle_id, {
                read_interval_id: null,
            });
            return mock_handle_id;
        });

        handleRpc('ipc-closePort', async (request) => {
            await sleepNodejs(500);
            if (request.handle === SERIAL_PORT_HANDLE_UNINITIALIZED) {
                // Not an error.
                // Same as "delete nullptr" which is a valid statement.
                return;
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
            if (val.read_interval_id !== null) {
                throw new Error(`Tried to start reading more than once without calling stopReading. Handle: ${request.handle}`);
            }
            // Send the front-end via .emit a bunch of data every so often
            // until they call ipc-stopReading. That will be to test the the IPC
            // communication between main and renderer works correctly, both ways.
            val.read_interval_id = setInterval(() => {
                // TODO: Send a dummy byte array, as if some bytes were read from the serial port.
            }, 2_000);
            // No response needed for start reading
        });

        handleRpc('ipc-stopReading', async (request) => {
            await sleepNodejs(500);
            const val = this.mock_handles.get(request.handle);
            if (val === undefined) {
                throw new Error(`Tried to stop reading from invalid handle: ${request.handle}`);
            }
            if (val.read_interval_id === null) {
                // Not an error.
                // Same as calling clearInterval twice on a NodeJS.Timeout object.
                return;
            }
            clearInterval(val.read_interval_id);
            val.read_interval_id = null;
        });

        handleRpc('ipc-write', async (request) => {
            await sleepNodejs(500);
            if (!this.mock_handles.has(request.handle)) {
                throw new Error(`Tried to write to invalid handle: ${request.handle}`);
            }
            // No response needed for write operation
        });

        handleRpc('ipc-read', async (request) => {
            await sleepNodejs(1_000);
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

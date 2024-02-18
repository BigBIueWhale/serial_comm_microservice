import { SERIAL_PORT_HANDLE_UNINITIALIZED } from "../../shared/src/ipc/clientToServer";
import { handleRpc, removeHandler } from "./rpc/handleRpc";
import { sleepNodejs } from "./utils/sleep.util";
import { v4 as uuidv4 } from 'uuid';
import { emitNotification } from "./rpc/emitNotification";
import { createHash } from 'crypto';
import { BrowserWindow } from "electron";

// This is mock state management for a handle.
// When using the real Rust implementation, the state behind
// the handle will be opaque to this Node.JS code.
type Handle = {
    read_interval_id: NodeJS.Timeout | null;
};

function stopReading(val: Handle) {
    if (val.read_interval_id !== null) {
        clearInterval(val.read_interval_id); // Stop the interval
    }
    else {
        // Not an error.
        // Same as calling clearInterval twice on a NodeJS.Timeout object.
    }
    val.read_interval_id = null; // Reset the read interval ID
}

function closePort(mock_handles: Map<string, Handle>, handle: string) {
    if (handle === SERIAL_PORT_HANDLE_UNINITIALIZED) {
        // Not an error.
        // Same as "delete nullptr" which is a valid statement.
        return;
    }
    const val = mock_handles.get(handle);
    if (val === undefined) {
        throw new Error(`Tried to close invalid handle (or close same handle twice): ${handle}`);
    }
    stopReading(val);
    void mock_handles.delete(handle);
}

export class MyApp {
    constructor(
        private mock_handles: Map<string, Handle> = new Map(),
    ) {}

    // I the meantime I've implemented dummy handlers.
    // TODO: Call the Rust gRPC microservice to perform actual serial communication.
    public setupEventHandlers(browserWindow: BrowserWindow): void {
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
            closePort(this.mock_handles, request.handle);
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
            const handleCopy = request.handle;
            const readCount = { value: 0 }; // Mutable object to track the number of reads
        
            val.read_interval_id = setInterval(() => {
                readCount.value++;
                if (readCount.value <= 9) {
                    // Use SHA-512 of readCount to generate deterministic random data
                    const hash = createHash('sha512').update(String(readCount.value)).digest('hex');
                    const dataSize = parseInt(hash.substring(0, 2), 16) % 11; // Deterministic size [0, 10] based on hash
                    // Use that same random-deterministic hash to generate the random data for the array.
                    const data = Array.from({length: dataSize}, (_, i) => parseInt(hash.substring(i*2, i*2 + 2), 16) % 256);
                    emitNotification(browserWindow,
                        'notify-serialDataReceived', {
                        handle: handleCopy,
                        data: new Uint8Array(data), // Convert to Uint8Array
                    });
                } else {
                    // Simulate serial port error
                    emitNotification(browserWindow,
                        'notify-serialError', {
                        handle: handleCopy,
                        error: "Serial port disconnected",
                    });
                    closePort(this.mock_handles, handleCopy);
                }
            }, 2_000);
            // No response needed for start reading
        });        

        handleRpc('ipc-stopReading', async (request) => {
            await sleepNodejs(500);
            const val = this.mock_handles.get(request.handle);
            if (val === undefined) {
                throw new Error(`Tried to stop reading from invalid handle: ${request.handle}`);
            }
            stopReading(val);
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

        removeHandler("ipc-listSerialPorts")
        removeHandler("ipc-openPort");
        removeHandler("ipc-closePort");
        removeHandler("ipc-startReading");
        removeHandler("ipc-stopReading");
        removeHandler("ipc-write");
        removeHandler("ipc-read");

        for (const kvp of this.mock_handles) {
            closePort(this.mock_handles, kvp[0]);
        }
    }
}

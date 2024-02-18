import React, { useState, useEffect , useMemo} from 'react';
import { Box, TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography } from '@mui/material';
import { invokeRpc } from '../rpc/invokeRpc';
import { SerialDataReceivedNotification, SerialErrorNotification } from "../../../shared/src/ipc/serverToClient"
import { SERIAL_PORT_HANDLE_UNINITIALIZED, SerialPortHandle } from '../../../shared/src/ipc/clientToServer';
import { z } from 'zod';
import { stringToAsciiUint8Array } from '../utils/stringToAsciiArray';
import { offNotification, onNotification } from '../rpc/handleNotification';

export const SerialCommPage: React.FC = () => {
    const [isReady, setIsReady] = useState(false);
  
    useEffect(() => {
      const cleanupAndInitialize = async () => {
        try {
          // Cleanup so no ports are left open from previous run.
          // Will happen if the user reloads the renderer but leaves the main as is.
          // Since web doesn't support cleanup on close, we'll do cleanup on start!

          // Of course, the backend also cleans up when it closes, so this cleanup
          // is for the sitations where the renderer refreshed, but the main remembers
          // last time.
          await invokeRpc('ipc-cleanup', {});
          setIsReady(true);
        } catch (error) {
          // TODO: Error toast here
          console.error("Failed to clean up and initialize:", error);
        }
      };
  
      cleanupAndInitialize();
    }, []);
  
    return isReady ? (
        <SerialCommPageImpl />
      ) : (
        <Typography variant="h6" component="h2">
          Cleaning up from previous run...
        </Typography>
      );
  };

function SerialCommPageImpl() {
    const [incomingDataBytes, setIncomingBytes] = useState(new Uint8Array([]));

    const incomingDataHex = useMemo((): string => {
        return Array.from(incomingDataBytes)
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
    }, [incomingDataBytes]);

    const incomingDataAnsi = useMemo((): string => {
        // For a more accurate ANSI representation, you might need a specific mapping or conversion.
        // This is a simplified version that treats the bytes as ISO-8859-1 (Latin1), which shares
        // the 0x00-0xFF range with Windows-1252 but lacks some of the special characters.
        // A comprehensive solution might involve mapping specific Windows-1252 characters.
        const decoder = new TextDecoder('iso-8859-1');
        return decoder.decode(incomingDataBytes);
    }, [incomingDataBytes]);

    const [sendingData, setSendingData] = useState('');
    const [availablePorts, setAvailablePorts] = useState<string[]>([]);
    const [serialPort, setSerialPort] = useState('');
    const [baudRate, setBaudRate] = useState('');

    // Handle to the open serial port
    const [handle, setHandle] = useState<z.infer<typeof SerialPortHandle>>(SERIAL_PORT_HANDLE_UNINITIALIZED);
    
    // Runs on mount
    useEffect(() => {
        invokeRpc('ipc-listSerialPorts', {}).then((result) => {
            setAvailablePorts(result);
        }).catch((reason) => {
            // TODO: Error toast here
            console.log(`Failed to list serial ports: ${reason}`);
        });
    }, [setAvailablePorts]);

    // Runs on mount
    useEffect(() => {
        const onError = (val: z.infer<typeof SerialErrorNotification>) => {
            // TODO: Error toast here
            console.log(`Error from handle: ${val}. Message: ${val.error}`);
        };
        const onDataReceived = (val: z.infer<typeof SerialDataReceivedNotification>) => {
            const newData = val.data;
            setIncomingBytes(prev => {
                // Create a new Uint8Array with a length that is the sum of the previous array and the new data
                const updatedArray = new Uint8Array(prev.length + newData.length);
                // Copy the contents of the previous array into the start of the updated array
                updatedArray.set(prev);
                // Copy the contents of the new data array into the updated array, starting at the position after the last element of the previous array
                updatedArray.set(newData, prev.length);

                return updatedArray;
            });
        };
        onNotification('notify-serialError', onError);
        onNotification('notify-serialDataReceived', onDataReceived);
        return () => {
            offNotification('notify-serialError', onError);
            offNotification('notify-serialDataReceived', onDataReceived);
        };
    }, []);

    const handleClear = () => {
        setIncomingBytes(new Uint8Array([]));
    };

    const handleSend = async () => {
        try {
            await invokeRpc('ipc-write', {
                handle: handle,
                data: stringToAsciiUint8Array(sendingData),
            });
            // Only clear if there was no error
            setSendingData("");
        }
        catch (ex) {
            // TODO: Error toast here
            console.log(`Error writing to port: ${handle}. ${ex}`);
        }
    };

    const handleConnect = async () => {
        // First close existing handle and set it to uninitialized
        setHandle((prev) => {
            if (prev !== SERIAL_PORT_HANDLE_UNINITIALIZED) {
                invokeRpc('ipc-closePort', { handle: prev }).catch((reason) => {
                    // TODO: Error toast here
                    console.log(`Error closing port: ${reason}`);
                });
            }
            return SERIAL_PORT_HANDLE_UNINITIALIZED;
        });
        // Then try opening the new port and start listening
        try {
            const newHandle = await invokeRpc('ipc-openPort', {
                port: serialPort,
                settings: {
                    baudRate: Number.parseInt(baudRate)
                }
            });
            setHandle(newHandle);
            await invokeRpc('ipc-startReading', {
                handle: newHandle,
            });
        }
        catch (ex) {
            // TODO: Error toast here
            console.log(`Error opening port: ${handle}. ${ex}`);
        }
    };

    const isConnected = handle !== SERIAL_PORT_HANDLE_UNINITIALIZED;

    return (
        <Box sx={{ padding: 2, backgroundColor: '#f5f5f5' }}>
            <h1 style={{ color: '#3f51b5' }}>Serial Communication Interface</h1>

            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <TextField
                    label="Incoming Data (ANSI)"
                    multiline
                    rows={4}
                    value={incomingDataAnsi}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        readOnly: true,
                    }}
                    style={{ backgroundColor: '#ffffff' }}
                />
                <TextField
                    label="Incoming Data (Hex)"
                    multiline
                    rows={4}
                    value={incomingDataHex}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        readOnly: true,
                    }}
                    style={{ backgroundColor: '#ffffff' }}
                />
                <Button variant="contained" color="primary" onClick={handleClear}>
                    Clear
                </Button>
            </Box>

            <TextField
                label="Data to Send"
                multiline
                rows={6}
                value={sendingData}
                onChange={(e) => setSendingData(e.target.value)}
                variant="outlined"
                fullWidth
                disabled={!isConnected}
                style={{ backgroundColor: '#ffffff', marginBottom: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleSend} disabled={!isConnected}>
                Send
            </Button>

            <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #3f51b5', borderRadius: '4px' }}>
                <h2 style={{ color: '#3f51b5' }}>Serial Connection</h2>
                <FormControl fullWidth style={{ marginBottom: 2 }}>
                    <InputLabel id="serial-port-label">Serial Port</InputLabel>
                    <Select
                        labelId="serial-port-label"
                        value={serialPort}
                        label="Serial Port"
                        onChange={(e) => setSerialPort(e.target.value)}
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {availablePorts.map((item) =>
                            <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="baud-rate-label">Baud Rate</InputLabel>
                    <Select
                        labelId="baud-rate-label"
                        value={baudRate}
                        label="Baud Rate"
                        onChange={(e) => setBaudRate(e.target.value)}
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {/* Placeholder for baud rates */}
                        <MenuItem value="9600">9600</MenuItem>
                        <MenuItem value="19200">19200</MenuItem>
                        {/* Add more baud rates here */}
                    </Select>
                </FormControl>

                <Button variant="contained" color="primary" onClick={handleConnect} style={{ marginTop: 2 }}>
                    Connect
                </Button>
            </Box>
        </Box>
    );
}

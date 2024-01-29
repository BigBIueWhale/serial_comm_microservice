import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { invokeRpc } from '../rpc/invokeRpc';
import { SERIAL_PORT_HANDLE_UNINITIALIZED, SerialPortHandle } from 'shared/src/ipc/clientToServer';
import { z } from 'zod';
import { stringToAsciiUint8Array } from '../utils/stringToAsciiArray';

export function SerialCommPage() {
    const [incomingDataAnsi, setIncomingDataAnsi] = useState('');
    const [incomingDataHex, setIncomingDataHex] = useState('');
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

    const handleClear = () => {
        setIncomingDataAnsi('');
        setIncomingDataHex('');
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
        // Then try opening the new port
        try {
            setHandle(await invokeRpc('ipc-openPort', {
                port: serialPort,
                settings: {
                    baudRate: Number.parseInt(baudRate)
                }
            }));
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

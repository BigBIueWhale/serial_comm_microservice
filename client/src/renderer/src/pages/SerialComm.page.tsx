import React, { useState } from 'react';
import { Box, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

export function SerialCommPage() {
    const [incomingDataAnsi, setIncomingDataAnsi] = useState('');
    const [incomingDataHex, setIncomingDataHex] = useState('');
    const [sendingData, setSendingData] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [serialPort, setSerialPort] = useState('');
    const [baudRate, setBaudRate] = useState('');

    const handleClear = () => {
        setIncomingDataAnsi('');
        setIncomingDataHex('');
    };

    const handleSend = async () => {
        // Placeholder for sending data

        // This function is defined in preload.ts
        const result: string = await window.electron.ipcRenderer.invoke('ipc-example1', sendingData);
        setSendingData("");
        setIncomingDataAnsi((prev) => prev + result);
    };

    const handleConnect = () => {
        setIsConnected(true);
        // Placeholder for connecting to serial port
    };

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
                        {/* Placeholder for serial ports */}
                        <MenuItem value="COM1">COM1</MenuItem>
                        <MenuItem value="COM2">COM2</MenuItem>
                        {/* Add more ports here */}
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

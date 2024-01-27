export function stringToAsciiUint8Array(str: string): Uint8Array {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        const asciiCode = str.charCodeAt(i);
        if (asciiCode > 127) {
            throw new Error(`Character '${str[i]}' at position ${i} is outside the ASCII range.`);
        }
        array[i] = asciiCode;
    }
    return array;
}

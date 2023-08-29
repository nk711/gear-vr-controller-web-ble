export const getAccelerometerFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer: ArrayBuffer | number[], offset: number, index: number) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(16 * index + offset, 16 * index + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 10000.0 * 9.80665 / 2048.0]))[0];
};

export const getGyroscopeFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer: ArrayBuffer | number[], offset: number, index: number) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(16 * index + offset, 16 * index + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 10000.0 * 0.017453292 / 14.285]))[0];
};

export const getMagnetometerFloatWithOffsetFromArrayBufferAtIndex = (arrayBuffer: ArrayBuffer | number[], offset: number) => {
    const arrayOfShort = new Int16Array(arrayBuffer.slice(32 + offset, 32 + offset + 2));
    return (new Float32Array([arrayOfShort[0] * 0.06]))[0];
};

export const getLength = (f1: number, f2: number, f3: number) => Math.sqrt(f1 ** 2 + f2 ** 2 + f3 ** 2);

export const getLittleEndianUint8Array = (hexString: string) => {
    const leAB = new Uint8Array(hexString.length >> 1);
    for (let i = 0, j = 0; i + 2 <= hexString.length; i += 2, j++) {
        leAB[j] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return leAB;
};
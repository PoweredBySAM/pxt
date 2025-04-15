export const lastTwoBytesToHex = (bytes: number[]) => {
    const bytesArr = Array.from(new Uint8Array(bytes));
    const lastTwo = bytesArr.slice(-2);
    return lastTwo.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

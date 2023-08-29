export type Controller  = {
    gattServer: BluetoothRemoteGATTServer
    customService: BluetoothRemoteGATTService
    customServiceWrite: BluetoothRemoteGATTCharacteristic
    customServiceNotify : BluetoothRemoteGATTCharacteristic
} | undefined

export enum SERVICE {
    PRIMARY_UUID = "4f63756c-7573-2054-6872-65656d6f7465",
    WRITE_UUID = "c8c51726-81bc-483b-a052-f7a14ea3d282",
    NOTIFY_UUID ="c8c51726-81bc-483b-a052-f7a14ea3d281"
}
export enum COMMAND {
    OFF          = '0000', // Turn all modes off and stop sending data
    SENSOR       = '0100', // Sensor mode, send touchpad and buttons data but update at lower rate (protocol > a > o.class)
    FIRMWARE     = '0200', // Firmware upgrade sequence
    CALIBRATE    = '0300', //
    KEEP_ALIVE   = '0400', // Keep Alive command - awake?
    NOTSURE      = '0500', // Settings mode
    LPM_ENABLE   = '0600',
    LPM_DISABLE  = '0700',
    VR_MODE      = '0800'  // high frequency evenmt data update  (protocol  > a > l.class)
}


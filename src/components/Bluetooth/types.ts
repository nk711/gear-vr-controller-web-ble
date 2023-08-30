export type Controller  = {
    gattServer: BluetoothRemoteGATTServer
    customService: BluetoothRemoteGATTService
    customServiceWrite: BluetoothRemoteGATTCharacteristic
    customServiceNotify : BluetoothRemoteGATTCharacteristic
} | undefined
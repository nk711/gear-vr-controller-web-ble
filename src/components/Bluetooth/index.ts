import {
  TIMESTAMP_FACTOR,
  ACCEL_FACTOR,
  GYRO_FACTOR,
} from "../../utils/Constants";
import {
  getAccelerometerFloatWithOffsetFromArrayBufferAtIndex,
  getGyroscopeFloatWithOffsetFromArrayBufferAtIndex,
  getLittleEndianUint8Array,
  getMagnetometerFloatWithOffsetFromArrayBufferAtIndex,
} from "../../utils/Utils";
import { COMMAND, Controller, SERVICE } from "./types";

// Initialises Bluetooth connection with controller
export const initBluetooth = async (): Promise<Controller> => {
  try {
    const gear_controller = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE.PRIMARY_UUID],
    });
    console.log('1')
    // gear_controller.addEventListener('gattserverdisconnected', onDeviceDisconnected); <- onDeviceDisconnected not defined
    const gattServer = await gear_controller.gatt!.connect();
    console.log('2')

    const customService = await gattServer.getPrimaryService(
      SERVICE.PRIMARY_UUID
    );

    console.log('3')

    // todo: battery service, device information service
    const customServiceWrite = await customService.getCharacteristic(
      SERVICE.WRITE_UUID
    );

    console.log('4')

    const customServiceNotify = await customService.getCharacteristic(
      SERVICE.NOTIFY_UUID
    );

    console.log('5')
    console.log('Primary', SERVICE.PRIMARY_UUID)
    console.log('Notify', SERVICE.NOTIFY_UUID)
    console.log('Write', SERVICE.WRITE_UUID)
    await customServiceNotify.startNotifications();

    console.log('6')

    customServiceNotify.addEventListener(
      "characteristicvaluechanged",
      onNotificationReceived
    );

    console.log('7')

    return {
      gattServer,
      customService,
      customServiceWrite,
      customServiceNotify,
    };
  } catch (error) {
    console.error("Bluetooth error:", error);
    return undefined;
  }
};

// Retrieves updates from controller
export const onNotificationReceived = (e: Event) => {
  const characteristic = e.target as BluetoothRemoteGATTCharacteristic;
  if (!characteristic.value) throw new Error("notification undefined");
  const { buffer } = characteristic.value;
  const eventData = new Uint8Array(buffer);

  // Max observed value = 315
  // (corresponds to touchpad sensitive dimension in mm)
  const axisX =
    (((eventData[54] & 0xf) << 6) + ((eventData[55] & 0xfc) >> 2)) & 0x3ff;

  // Max observed value = 315
  const axisY =
    (((eventData[55] & 0x3) << 8) + ((eventData[56] & 0xff) >> 0)) & 0x3ff;

  // com.samsung.android.app.vr.input.service/ui/c.class:L222
  const timestamp =
    ((new Int32Array(buffer.slice(0, 3))[0] & 0xffffffff) / 1000) *
    TIMESTAMP_FACTOR;

  // com.samsung.android.app.vr.input.service/ui/c.class:L222
  const temperature = eventData[57];

  // 3 x accelerometer and gyroscope x,y,z values per data event
  const accel = [
    getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4, 0),
    getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 6, 0),
    getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 8, 0),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4, 1),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 6, 1),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 8, 1),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4, 2),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 6, 2),
    // getAccelerometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 8, 2)
  ].map((v) => v * ACCEL_FACTOR);

  const gyro = [
    getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 10, 0),
    getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 12, 0),
    getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 14, 0),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 10, 1),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 12, 1),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 14, 1),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 10, 2),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 12, 2),
    // getGyroscopeFloatWithOffsetFromArrayBufferAtIndex(buffer, 14, 2)
  ].map((v) => v * GYRO_FACTOR);

  const magX = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 0);
  const magY = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 2);
  const magZ = getMagnetometerFloatWithOffsetFromArrayBufferAtIndex(buffer, 4);

  const triggerButton = Boolean(eventData[58] & (1 << 0));
  const homeButton = Boolean(eventData[58] & (1 << 1));
  const backButton = Boolean(eventData[58] & (1 << 2));
  const touchpadButton = Boolean(eventData[58] & (1 << 3));
  const volumeUpButton = Boolean(eventData[58] & (1 << 4));
  const volumeDownButton = Boolean(eventData[58] & (1 << 5));

  console.log("axisX:", axisX, "axisY:", axisY);

  return ({
    accel,
    gyro,
    magX,
    magY,
    magZ,
    timestamp,
    temperature,
    axisX,
    axisY,
    triggerButton,
    homeButton,
    backButton,
    touchpadButton,
    volumeUpButton,
    volumeDownButton,
  });
};

export const runCommand = (controller: Controller, commandValue: COMMAND) => {
  controller!.customServiceWrite
    .writeValue(getLittleEndianUint8Array(commandValue))
    .catch(onBluetoothError);
};

const onBluetoothError = (e: Error) => {
  console.warn("Error: " + e);
};

import { ChangeEvent, useState } from "react";
import "./App.css";
import {
  initBluetooth,
  onNotificationReceived,
  runCommand
} from "./components/Bluetooth";
import { COMMAND, Controller } from "./components/Bluetooth/types";

const App = () => {
  const [controller, setController] = useState<Controller>(undefined);
  const [option, setOption] = useState<COMMAND>();
  
  const connect = async () => {
    try {
      const controller = await initBluetooth();
      if (controller === undefined) throw new Error("Controller undefined");
      await controller.customServiceNotify.startNotifications();
      controller.customServiceNotify.addEventListener(
        "characteristicvaluechanged",
        onNotificationReceived
      );
      console.log("Connected to the controller.");
      setController(controller);
    } catch (e) {}
  };

  const disconnect = () => {
    try {
      if (controller === undefined) throw new Error("Controller is undefined");
      controller!.gattServer.disconnect();
    } catch (e) {
      console.log("Error", e);
    }
  };

  const sensor = () => {
     // Have to do the SENSOR -> VR -> SENSOR cycle a few times to ensure it runs
     runCommand(controller, COMMAND.VR_MODE)
     runCommand(controller, COMMAND.SENSOR)
  }

  const sendCommand = () => {
    try {
      if (option !== undefined) runCommand(controller, option)
    } catch (e) {
      console.log('errors:', e);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as COMMAND;
    setOption(newValue);
    console.log(newValue)
  };

  return (
    <div className="App">
        <h1>Samsung Gear VR Controller</h1>
        <button id="connectButton" onClick={() => connect()}>
          Connect
        </button>
        <button id="disconnectButton" onClick={() => disconnect()}>
          Disconnect
        </button>
        <button id="sensor" onClick={() => sensor()}>
          Sensor
        </button>

        <button id="sendCommandButton" onClick={()=>sendCommand()}>Send Command</button>
        <select id="commandSelect" onChange={(e)=> handleChange(e)}>
          <option value="0000">
            Turn all modes off and stop sending data [0000]
          </option>
          <option value="0100">Enter Sensor mode [0100]</option>
          <option value="0200">
            Initiate firmware upgrade sequence [0200]
          </option>
        </select>
    </div>
  );
};

export default App;

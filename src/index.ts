import express from "express";
import { existsSync, readFileSync } from "fs";
import { validate } from "jsonschema";
import process from "process";
import yargs from "yargs/yargs";
import NotImplemented from "./errors/NotImplemented";
import ServerProcess from "./process/ServerProcess";
import { lineReader } from "./reader";
import { ConfigSingle, ConfigMultiple } from "./types";
import { createAccessor } from "./access/AccessorFactory";

const schemaFile = "./config.schema.json";

const args = yargs(process.argv.slice(2)).argv;

if (!Object.keys(args).includes("config")) {
  throw Error("CLI doesn't contain --config flag");
}

const configFileLocation = (args as any).config as string;

if (!existsSync(configFileLocation)) {
  throw Error("Config file doesn't exist");
}

const schemaBuffer = readFileSync(schemaFile, { encoding: "utf-8" });
const schema = JSON.parse(schemaBuffer);

const configBuffer = readFileSync(configFileLocation, { encoding: "utf-8" });
const configTemp = JSON.parse(configBuffer);

validate(configTemp, schema, { throwError: true });
const serversProcesses: ServerProcess[] = [];

const findProcess = (name: string): ServerProcess | undefined => {
  for (const serverProcess of serversProcesses) {
    if (serverProcess.config.server.name === name) {
      return serverProcess;
    }
  }
  return undefined;
};

const app = express();
let customExecutable: string | undefined = configTemp.executable
if (customExecutable) {
  if (!existsSync(customExecutable)) {
    console.error(`Unable to find executable ${customExecutable}, switched to default`)
    customExecutable = undefined
  }
}



if (configTemp.single) {
  const config  = configTemp as ConfigSingle
  const serverConfig = config.single;
  const accessor = createAccessor(config);

  const serverProcess = new ServerProcess(accessor);
  serverProcess.executable = customExecutable;
  serverProcess.config = serverConfig;
  serversProcesses.push(serverProcess);
} else if (configTemp.multiple) {
  const multipleConfig = configTemp as ConfigMultiple;
  const accessor = createAccessor(multipleConfig);
  
  for (const config of multipleConfig.multiple) {
    
    const serverProcess = new ServerProcess(accessor);
    serverProcess.executable = customExecutable;
    serverProcess.config = config;
    serversProcesses.push(serverProcess);
    console.log("Registered server " + config.server.name);
    
  }

  app.post("/api/stopserver/:name", (req, res) => {
    const { name } = req.params;
    const serverProcess = findProcess(name);
    if (serverProcess) {
      if (serverProcess.isStarted()) {
        serverProcess.stopProcess();
      }
      res.json({ msg: "Stopping server" });
    } else {
      res.status(400);
      res.json({ msg: "Error, unknown process with this name" });
    }
  });

  app.post("/api/startserver/:name", async (req, res) => {
    const { name } = req.params;
    const serverProcess = findProcess(name);
    if (serverProcess) {
      if (!serverProcess.isStarted()) {
        await serverProcess.startProcess();
      }
      res.json({ msg: "Starting server" });
    } else {
      res.status(400);
      res.json({ msg: "Error, unknown process with this name" });
    }
  });
} else {
  throw new NotImplemented("Unknown json format");
}

const port = 6969;

app.post("/api/stopserver", (req, res) => {
  for (const serverProcess of serversProcesses) {
    if (serverProcess.isStarted()) {
      serverProcess.stopProcess();
    }
  }
  res.json({ msg: "Stopping servers" });
});

app.post("/api/startserver", (req, res) => {
  for (const serverProcess of serversProcesses) {
    if (!serverProcess.isStarted()) {
      serverProcess.startProcess();
    } else if (!serverProcess.askStart) {
      serverProcess.callbacks.push(() => {
        serverProcess.startProcess();
        serverProcess.askStart = true;
      });
    }
  }
  res.json({ msg: "Starting servers" });
});

lineReader.on("line", (line) => {
  let serverProcess =
    serversProcesses.length == 1
      ? serversProcesses[0]
      : findProcess(line.split(":")[0]);
  if (serverProcess !== undefined) {
    if (serverProcess.isStarted()) {
      if (line.includes("stop")) {
        serverProcess.stopProcess();
      } else {
        serverProcess.input(line.split(":")[1] + "\n");
      }
    }
  } else {
    console.log(`Server process not found with name ${line.split(":")[0]}`)
  }
});

process.on("beforeExit", () => {
  for (const serverProcess of serversProcesses) {
    serverProcess.stopProcess();
  }
});

app.listen(port, () => {
  console.log("Ecoute des requêtes d'update sur le port " + port);
});

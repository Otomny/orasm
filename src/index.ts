import express from "express";
import { existsSync, readFileSync } from "fs";
import { validate } from "jsonschema";
import process from "process";
import yargs from "yargs/yargs";
import ServerProcess from "./process/ServerProcess";
import { lineReader } from "./reader";
import { Config } from "./types";

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
const config = JSON.parse(configBuffer) as Config;

validate(config, schema, { throwError: true });

const serverProcess = new ServerProcess();

const app = express();
const port = 6969;

app.post("/api/stopserver", (req, res) => {
  if (serverProcess.isStarted()) {
    res.json({ msg: "Stopping server" });
    serverProcess.stopProcess();
  } else {
    res.json({ msg: "No need for stop" });
  }
});

app.post("/api/startserver", (req, res) => {
  if (!serverProcess.isStarted()) {
    res.json({ msg: "Starting server" });
    serverProcess.startProcess();
  } else if (!serverProcess.askStart) {
    serverProcess.callbacks.push(() => {
      serverProcess.startProcess();
      serverProcess.askStart = true;
    });
    res.json({ msg: "Delayed start" });
  } else {
    res.json({ msg: "No need to restart" });
  }
});

serverProcess.setConfig(config);

lineReader.on("line", (line) => {
  if (serverProcess.isStarted()) {
    if (line.includes("stop")) {
      serverProcess.stopProcess();
    } else {
      serverProcess.input(line + "\n");
    }
  }
});

process.on("beforeExit", () => {
  serverProcess.stopProcess();
});

app.listen(port, () => {
  console.log("Ecoute des requêtes d'update sur le port " + port);
});

import express from "express";
import process from "process";
import { execSync } from "child_process";
import ServerProcess from "./process/ServerProcess";
import NotImplemented from "./errors/NotImplemented";
import yargs from "yargs/yargs";
// import { hideBin } from "yargs/helpers";

const args = yargs(process.argv.slice(2)).argv;

console.log(args);

throw new NotImplemented("Parse command argument not implemented");

const serverProcess = new ServerProcess();

const app = express();
const port = 6969;

// execSync();

app.post("/api/stopserver", (req, res) => {
  if (serverProcess.isStarted()) {
    serverProcess.stopProcess();
  }
});

app.post("/api/startserver", (req, res) => {
  if (!serverProcess.isStarted()) {
    throw new NotImplemented("Moving file to plugin folder is not implemented");
    serverProcess.startProcess();
  }
});

serverProcess.setConfig();

app.listen(port, () => {
  console.log("Ecoute des requêtes d'update sur le port " + port);
});

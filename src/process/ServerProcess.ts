import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import path from "path";
import { env } from "process";
import { Config } from "../types";

export default class ServerProcess {
  private static JARFILE_ARG = "%jarfile%";
  private static ADDITIONAL_ARG = "%additional%";

  public static command: string =
    "java -Xms512M -Xmx4G -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions " +
    "-XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:-UseParallelGC -XX:-UseG1GC -XX:+UseZGC -XX:+AlwaysPreTouch -XX:InitiatingHeapOccupancyPercent=15" +
    ` -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 --add-modules=jdk.incubator.vector ${ServerProcess.ADDITIONAL_ARG}  -jar ${ServerProcess.JARFILE_ARG} nogui`;

  private serverProcess: ChildProcessWithoutNullStreams;
  public config: Config;
  public callbacks: Function[];
  public askStart: boolean;

  constructor() {
    this.askStart = false;
    this.callbacks = [];
  }

  public input(line: string): void {
    this.serverProcess.stdin.write(line);
  }

  public stopProcess() {
    this.input("stop\n");
    this.callbacks.push(() => {
      this.serverProcess = undefined;
      this.askStart = false;
    });
  }

  public isStarted(): boolean {
    return this.serverProcess !== undefined;
  }

  private processClose(): void {
    this.callbacks.forEach((callback) => callback());
    this.callbacks = [];
  }

  public startProcess(): void {
    // spawn()
    if (!this.config) {
      throw new Error("Config has not been set");
    }
    const fullCommand = ServerProcess.command
      .replace(ServerProcess.ADDITIONAL_ARG, this.config.runtimeSettings?.vmArgs ?? "")
      .replace(ServerProcess.JARFILE_ARG, this.config.server.executable)
      .split(/\s+/);
    console.log(fullCommand)
    const folder = this.config.server.folder;
    const pluginFolder = path.join(folder, "plugins");
    for (const pluginInfo of this.config.plugins) {
      const finalPath = path.join(pluginFolder, pluginInfo.to);
      if (existsSync(finalPath)) {
        unlinkSync(finalPath);
      }
      copyFileSync(pluginInfo.from, finalPath);
      console.log("Copied " + pluginInfo.name);
    }
    const serverProcess = spawn(fullCommand[0], fullCommand.slice(1), {
      cwd: folder,
      env: env,
    });
    serverProcess.stdout.on("data", (data) => {
      const str = data.toString() as string;
      process.stdout.write(`${[this.config.server.name ?? "SO"]} ${str}`);
      if (
        str.includes("Closing Thread Pool") ||
        str.includes("Flushing Chunk IO")
      ) {
        this.serverProcess.stdin.end();
        this.serverProcess.stdout.destroy();
        this.serverProcess.stderr.destroy();
      }
    });
    serverProcess.stderr.on("data", (data) => {
      process.stderr.write(
        `${[this.config.server.name ?? "SE"]} ${data.toString() as string}`
      );
    });
    serverProcess.on("exit", () => {
      console.log(`${[this.config.server.name ?? "SC"]} Server exited`);
    });
    serverProcess.on("close", (err) => {
      console.log(
        `${[this.config.server.name ?? "SC"]} Server exited with status ${err}`
      );
      this.processClose();
    });

    this.serverProcess = serverProcess;
  }
}

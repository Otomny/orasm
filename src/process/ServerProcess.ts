import { spawn } from "child_process";
import path from "path";
import { env } from "process";
import Accessor from "../access/Accessor";
import WrappedProcess from "../access/WrappedProcess";
import { Config } from "../types";

export default class ServerProcess {
  private static JARFILE_ARG = "%jarfile%";
  private static ADDITIONAL_ARG = "%additional%";
  private static EXECUTABLE = "%executable%";
  private static RAM_SETTINGS = "%ram%"

  public static command: string =
    `${ServerProcess.EXECUTABLE} ${ServerProcess.RAM_SETTINGS} -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions ` +
    "-XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:-UseParallelGC -XX:-UseG1GC -XX:+UseZGC -XX:+AlwaysPreTouch -XX:InitiatingHeapOccupancyPercent=15" +
    ` -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 --add-modules=jdk.incubator.vector ${ServerProcess.ADDITIONAL_ARG}  -jar ${ServerProcess.JARFILE_ARG} nogui`;

  public config: Config;
  public executable: string | undefined;
  public callbacks: Function[];
  public askStart: boolean;
  private serverProcess: WrappedProcess;
  private accessor: Accessor;

  constructor(accessor: Accessor) {
    this.askStart = false;
    this.accessor = accessor;
    this.callbacks = [];
  }

  public input(line: string): void {
    this.serverProcess.writeStdin(line);
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

  public async startProcess(): Promise<void> {
    // spawn()
    if (!this.config) {
      throw new Error("Config has not been set");
    }


    const fullCommand = ServerProcess.command
      .replace(ServerProcess.EXECUTABLE, this.executable ?? "java")
      .replace(ServerProcess.ADDITIONAL_ARG, this.config.runtimeSettings?.vmArgs ?? "")
      .replace(ServerProcess.RAM_SETTINGS, this.config.runtimeSettings?.ram ?? "-Xms512M -Xmx2G")
      .replace(ServerProcess.JARFILE_ARG, this.config.server.executable)
      .split(/\s+/);


    console.log(`[${this.config.server.name ?? "SO"}] = LAUNCH > ${fullCommand.join(' ')}`)
    const folder = this.config.server.folder;
    const pluginFolder = path.join(folder, "plugins");


    for (const pluginInfo of this.config.plugins) {
      const finalPath = path.join(pluginFolder, pluginInfo.to);
      if (await this.accessor.exists(finalPath)) {
        await this.accessor.deleteFile(finalPath);
      }
      await this.accessor.copyFile(pluginInfo.from, finalPath);
      console.log("Copied " + pluginInfo.name);
    }

    const wrappedProcess = await this.accessor.launchProcess(
      fullCommand[0],
      fullCommand.slice(1),
      folder
    );

    wrappedProcess.onStdout((line: string) => {
      process.stdout.write(`[${this.config.server.name ?? "SO"}] ${line}`,
        "utf-8");
      if (
        line.includes("Closing Thread Pool") ||
        line.includes("Flushing Chunk IO")
      ) {
        this.serverProcess.kill();
      }

    });

    wrappedProcess.onStderr((line: string) => {
      process.stderr.write(`[${this.config.server.name ?? "SE"}] ${line}`,
        "utf-8");
    });

    wrappedProcess.onClose(() => {
      this.processClose();
    });
    

    this.serverProcess = wrappedProcess;
  }
}

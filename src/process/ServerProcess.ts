import NotImplemented from "../errors/NotImplemented";

export default class ServerProcess {
  private static JARFILE_ARG = "%jarfile%";

  public static command: string =
    "java -Xms512M -Xmx4G -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions " +
    "-XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:-UseParallelGC -XX:-UseG1GC -XX:+UseZGC -XX:+AlwaysPreTouch -XX:InitiatingHeapOccupancyPercent=15" +
    ` -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -jar ${ServerProcess.JARFILE_ARG} nogui`;

  constructor() {}

  public setConfig(): void {
    throw new NotImplemented("setConfig is not implemented");
  }

  public stopProcess() {
    throw new NotImplemented("stopProcess is not implemented.");
  }

  public isStarted(): boolean {
    throw new NotImplemented("isStarted is not implemented");
  }

  public startProcess(): void {
    throw new NotImplemented("startProcess is not implemented");
  }
}

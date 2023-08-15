
export type MaybeAsync<T> = T | Promise<T>;
export type OperatingSystem = "windows" | "linux" | "macos" | "unknown";
export type OperatingSystemMap<T> = { [key in OperatingSystem]: T };

export interface Config {
  server: {
    name?: string | undefined;
    folder: string;
    executable: string;
  };
  plugins: {
    from: string;
    to: string;
    name: string;
  }[],
  runtimeSettings: {
    vmArgs: string | undefined;
    ram: string | undefined
  }
}

export type RemoteServer = {
  host: string;
  user: string;
  port: number;
  password: string | undefined;
  sshKeyFile: string | undefined;
  os: OperatingSystem;
} | undefined

export interface ConfigSingle {
  single: Config;
  remoteServer: RemoteServer;
  executable: string;
}

export interface ConfigMultiple {
  multiple: Config[],
  remoteServer: RemoteServer;
  executable: string;
}

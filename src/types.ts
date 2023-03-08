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
  }[];
}

export interface ConfigSingle {
  single: Config;
}

export interface ConfigMultiple {
  multiple: Config[];
}

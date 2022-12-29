export interface Config {
  server: {
    folder: string;
    executable: string;
  };
  plugins: {
    from: string;
    to: string;
    name: string;
  }[];
}

import { MaybeAsync } from "../types";
import FileAccessor from "./Accessor";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import WrappedProcess from "./WrappedProcess";
import LocalProcess from "./LocalProcess";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { env } from "process";

/**
 * Local file accessor.
 */
export default class LocalAccessor extends FileAccessor {
    constructor() {
        super();
    }

    /**
     * 
     * @param from 
     * @param finalPath 
     */
    copyFile(from: string, finalPath: string): void {
        copyFileSync(from, finalPath);
    }

    deleteFile(path: string): void {
        unlinkSync(path);
    }


    exists(path: string): boolean {
        return existsSync(path);
    }

    launchProcess(command: string, args: string[], cwd: string): MaybeAsync<WrappedProcess> {
        const process: ChildProcessWithoutNullStreams = spawn(command, args, { cwd: cwd, env, shell: true });
        return new LocalProcess(process);
    }


}
import { MaybeAsync } from "../types";
import WrappedProcess from "./WrappedProcess";
import { ChildProcessWithoutNullStreams } from "child_process";

export default class LocalProcess extends WrappedProcess {

    constructor(private process: ChildProcessWithoutNullStreams) {
        super();
    }

    getPid(): number {
        return this.process.pid;
    }

    writeStdin(line: string): void {
        this.process.stdin.write(line);
    }


    kill(): void {
        this.process.stdin.end();
        this.process.stdout.destroy();
        this.process.stderr.destroy();
        this.process.kill();
    }

    onStdout(callback: (line: string) => void): void {
        this.process.stdout.on("data", (chunk) => {
            callback(chunk.toString());
        })
    }

    onStderr(callback: (line: string) => void): void {
        this.process.stderr.on("data", (chunk) => {
            callback(chunk.toString());
        })
    }

    onClose(callback: () => void): void {
        this.process.on("close", () => {
            callback();
        })
    }



}
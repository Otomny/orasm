import { MaybeAsync } from "../types";

/**
 * Wrap a process to provide a common interface for all processes. Remote and local
 */
export default abstract class WrappedProcess {

    /**
     * Get the process id of the wrapped process.
     */
    abstract getPid(): MaybeAsync<number>;

    /**
     * Kill the wrapped process.
     */
    abstract kill(): MaybeAsync<void>;

    /**
     * Write a line to the stdin of the wrapped process.
     * 
     * @param line The line to write
     */
    abstract writeStdin(line: string): MaybeAsync<void>;


    /**
     * A callback for when a line is written to stderr.
     * 
     * @param callback The callback to call when a line is written to stderr.
     */
    abstract onStdout(callback: (line: string) => void): void;

    /**
     * A callback for when a line is written to stderr.
     * 
     * @param callback The callback to call when a line is written to stderr.
     */
    abstract onStderr(callback: (line: string) => void): void;

    /**
     * A callback for when the process is closed.
     * 
     * @param callback The callback to call when the process is closed.
     */
    abstract onClose(callback: () => void): void;
}
import { MaybeAsync } from "../types";
import WrappedProcess from "./WrappedProcess";

/**
 * Abstract class for file accessors.
 * 
 */
export default abstract class Accessor {

    /**
     * Copy a file from one location to another.
     * 
     * @param from  The source path
     * @param finalPath  The destination path
     */
    abstract copyFile(from: string, finalPath: string): MaybeAsync<void>;

    /**
     * Delete a file.
     * 
     * @param path The path to the file
     */
    abstract deleteFile(path: string): MaybeAsync<void>;

    /**
     * Check if a file exists.
     * 
     * @param path The path to the file 
     */
    abstract exists(path: string): MaybeAsync<boolean>;

    /**
     * Execute a command in a given directory.
     * 
     * @param command The command to execute
     * @param args  The arguments to the command
     * @param cwd  The directory to execute the command in
     */
    abstract launchProcess(command: string, args: string[], cwd: string): MaybeAsync<WrappedProcess>;
}
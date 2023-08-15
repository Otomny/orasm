import { Config, ConfigMultiple, ConfigSingle } from "../types";
import Accessor from "./Accessor";
import LocalAccessor from "./LocalAccessor";
import SSHRemoteAccessor from "./SSHRemoteAccessor";

/**
 * 
 * 
 * @param config Config object
 * @returns An accessor object or null if no accessor is found
 */
export function createAccessor(config: ConfigSingle | ConfigMultiple): Accessor | null {
    if (config.remoteServer) {
        return new SSHRemoteAccessor(config.remoteServer);
    } else {
        return new LocalAccessor();
    }
}
import { MaybeAsync, OperatingSystem, OperatingSystemMap, RemoteServer } from "../types";
import FileAccessor from "./Accessor";
import { NodeSSH, Config as SshConfig } from "node-ssh";
import WrappedProcess from "./WrappedProcess";
import SSHRemoteProcess from "./SSHRemoteProcess";
// const {NodeSSH} = require('node-ssh')

// const ssh = new NodeSSH()

export default class SSHRemoteAccessor extends FileAccessor {

    private static REMOVE_CMD: OperatingSystemMap<string> = {
        "windows": "Remove-Item", // powershell
        "linux": "rm", // bash
        "macos": "rm", // bash
        "unknown": "rm" // bash
    }

    private static EXISTS_CMD: OperatingSystemMap<string> = {
        "windows": "Test-Path", // powershell
        "linux": "test -f", // bash
        "macos": "test -f", // bash
        "unknown": "test -f" // bash
    }

    private ssh: NodeSSH;
    private config: SshConfig;
    private os: OperatingSystem = "unknown"

    constructor(remoteServer: RemoteServer) {
        super();
        this.ssh = new NodeSSH();
        if (remoteServer) {
            this.os = remoteServer.os || "linux"
            if (!remoteServer.password && !remoteServer.sshKeyFile) {
                throw new Error("No password or ssh key file provided for remote server")
            }
            let config: SshConfig = {
                host: remoteServer.host,
                username: remoteServer.user,
                port: remoteServer.port,

            }
            if (remoteServer.sshKeyFile) {
                config.privateKeyPath = remoteServer.sshKeyFile
            } else if (remoteServer.password) {
                config.password = remoteServer.password
            }
            if (remoteServer.password) {
                config.password = remoteServer.password;
            }
            this.config = config;
        } else {
            throw new Error("No remote server provided")
        }
    }

    async copyFile(from: string, finalPath: string): Promise<void> {
        let nodessh = await this.ssh.connect(this.config)
        await nodessh.putFile(from, finalPath)
    }

    async deleteFile(path: string): Promise<void> {
        let nodessh = await this.ssh.connect(this.config)
        await nodessh.execCommand(SSHRemoteAccessor.REMOVE_CMD[this.os] + " " + path)
    }

    async exists(path: string): Promise<boolean> {
        let nodessh = await this.ssh.connect(this.config)
        let result = await nodessh.execCommand(SSHRemoteAccessor.EXISTS_CMD[this.os] + " " + path)
        return result.code === 0;
    }

    async launchProcess(command: string, args: string[], cwd: string): Promise<WrappedProcess> {
        let nodessh = await this.ssh.connect(this.config)
        return new SSHRemoteProcess(nodessh, command, args, cwd);
    }

}
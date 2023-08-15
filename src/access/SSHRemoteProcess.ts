import { NodeSSH } from "node-ssh";
import { MaybeAsync } from "../types";
import WrappedProcess from "./WrappedProcess";
import { env } from "process";
import { Readable } from "stream";

export default class SSHRemoteProcess extends WrappedProcess {


    private stdoutCallbacks: ((line: string) => void)[] = [];
    private stderrCallbacks: ((line: string) => void)[] = [];
    private closeCallbacks: (() => void)[] = [];
    private inputStream: Readable;

    constructor(private nodessh: NodeSSH,
        private command: string,
        private args: string[],
        private cwd: string) {
        super();
        this.inputStream = new Readable()
        this.inputStream._read = () => { }
        nodessh.exec(command, args,
            {
                cwd: cwd,
                onStdout: (chunk) => {
                    this.stdoutCallbacks.forEach(callback => {
                        callback(chunk.toString())
                    })
                },
                onChannel: (clientChannel) => {
                    clientChannel.on("exit", (c) => {
                        this.closeCallbacks.forEach(callback => {
                            callback()
                        })
                    })
                },
                onStderr: (chunk) => {
                    this.stderrCallbacks.forEach(callback => {
                        callback(chunk.toString())
                    })
                },
                stream: 'both',
                encoding: 'utf8',
                stdin: this.inputStream
            })
    }

    /**
     * 
     * @returns the pid of the process
     */
    async getPid(): Promise<number> {
        // try to find the proccess id using the command
        let command = `ps -ef | grep "${this.command}"`
        let result = await this.nodessh.execCommand(command)
        if (result.code !== 0) {
            return -1
        }
        let lines = result.stdout.split("\n")
        let line = lines.find(line => line.includes(this.command))
        if (!line) {
            return -1
        }
        let parts = line.split(/\s+/)
        return parseInt(parts[1])
    }

    /**
     * Attempts to kill the process
     */
    async kill(): Promise<void> {
        let processId = await this.getPid()
        if (processId === -1) {
            return
        }
        await this.nodessh.execCommand(`kill ${processId}`)
    }


    /**
     * 
     * @param line Write a line to the stdin of the process
     */
    writeStdin(line: string): void {
        this.inputStream.push(line, "utf-8")
    }

    onStderr(callback: (line: string) => void): void {
        this.stderrCallbacks.push(callback)
    }

    onStdout(callback: (line: string) => void): void {
        this.stdoutCallbacks.push(callback)
    }

    onClose(callback: () => void): void {
        this.closeCallbacks.push(callback)
    }

}
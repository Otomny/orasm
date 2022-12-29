import EventEmitter from "events";

interface LineReader extends EventEmitter {
  on(event: "line", listener: (data: string) => void): this;
}

function stdinLineByLine(): LineReader {
  const stdin = new EventEmitter();
  let buff = "";

  process.stdin
    .on("data", (data) => {
      buff += data;
      let lines = buff.split(/\r\n|\n/);
      buff = lines.pop();
      lines.forEach((line) => stdin.emit("line", line));
    })
    .on("end", () => {
      if (buff.length > 0) stdin.emit("line", buff);
    });

  return stdin;
}

const lineReader = stdinLineByLine();
export { lineReader };

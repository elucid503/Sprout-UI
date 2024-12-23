import * as SassCompiler from "sass";

import { watch } from "chokidar"; // Use chokidar for recursive watching
import { writeFile, mkdir } from "fs/promises";

import Path from "path";

// Set Config

const Config: { Path: string, Output: string } = {

    Path: "./Library",
    Output: "./Out",

}

// Watch for File Changes

// @ts-expect-error - recursive is not in the types
const Watcher = watch(Config.Path, { persistent: true, ignoreInitial: true, recursive: true });

Watcher.on("change", async (FilePath) => {

    if (FilePath.endsWith(".scss")) {

        // Compile File

        const Result = await SassCompiler.compileAsync(FilePath, {

            style: "compressed",

        }).catch((Error) => {
            
            console.error(Error.message);
            return null;

        });

        if (!Result) return;

        // Write Output File

        const OutputFilePath = Path.join(Config.Output, Path.relative(Config.Path, FilePath)).replace(".scss", ".css");
        const WriteRes = await writeFile(OutputFilePath, Result.css).then(() => true).catch(() => {
            
            // Try creating the directory, chaining the result
            
            const DirPath = Path.dirname(OutputFilePath);
            return mkdir(DirPath, { recursive: true }).then(() => writeFile(OutputFilePath, Result.css).then(() => true).catch(() => false)).catch(() => false);

        });

        // Log

        console.log(`${Result && WriteRes ? "Compiled" : "Failed to Compile"} ${FilePath}`);

    }

});

// Log Startup

console.log("Watching for File Changes in " + Config.Path);
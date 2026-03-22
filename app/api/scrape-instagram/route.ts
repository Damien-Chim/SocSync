import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const requestSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9._]+$/, "Username contains invalid characters"),
});

const PYTHON_COMMANDS = [
  { command: "py", args: ["-3"] as string[] },
  { command: "python", args: [] as string[] },
  { command: "python3", args: [] as string[] },
];

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = requestSchema.parse(body);

    const scraperDir = path.join(process.cwd(), "scraper");
    const scriptPath = path.join(scraperDir, "run_pipeline.py");

    let lastError: unknown;

    for (const python of PYTHON_COMMANDS) {
      try {
        const { stdout, stderr } = await execFileAsync(
          python.command,
          [...python.args, scriptPath, "--account", username],
          {
            cwd: scraperDir,
            timeout: 10 * 60 * 1000,
            maxBuffer: 10 * 1024 * 1024,
            env: {
              ...process.env,
              PYTHONIOENCODING: "utf-8",
            },
          }
        );

        return NextResponse.json({
          ok: true,
          username,
          stdout,
          stderr,
          eventsFile: path.join(scraperDir, "events.json"),
        });
      } catch (error) {
        lastError = error;

        if (!isMissingPythonCommand(error)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error("No Python runtime found to execute the scraper.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid username payload.",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Instagram scraping failed.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

function isMissingPythonCommand(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as NodeJS.ErrnoException;
  return maybeError.code === "ENOENT";
}

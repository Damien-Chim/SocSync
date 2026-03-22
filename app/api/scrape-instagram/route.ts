import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
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
  societyId: z.string().uuid().optional(),
});

function getPythonCommands(scraperDir: string) {
  const venvPython = path.join(scraperDir, "venv", "bin", "python");
  const venvPythonWin = path.join(scraperDir, "venv", "Scripts", "python.exe");
  return [
    { command: venvPython, args: [] as string[] },
    { command: venvPythonWin, args: [] as string[] },
    { command: "py", args: ["-3"] as string[] },
    { command: "python", args: [] as string[] },
    { command: "python3", args: [] as string[] },
  ];
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, societyId } = requestSchema.parse(body);

    const scraperDir = path.join(process.cwd(), "scraper");
    const scriptPath = path.join(scraperDir, "run_pipeline.py");

    const scriptArgs = ["--account", username];
    if (societyId) {
      scriptArgs.push("--society-id", societyId);
    }

    let lastError: unknown;

    for (const python of getPythonCommands(scraperDir)) {
      try {
        const { stdout, stderr } = await execFileAsync(
          python.command,
          [...python.args, scriptPath, ...scriptArgs],
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

        let scrapedEvents: unknown[] = [];
        try {
          const eventsRaw = await readFile(
            path.join(scraperDir, "events.json"),
            "utf-8"
          );
          const allEvents = JSON.parse(eventsRaw) as Array<{
            source_url?: string;
            source_image?: string;
            event?: {
              is_event_like?: boolean;
              confidence?: number;
              event_title?: string;
              description?: string;
              category?: string;
              date?: string;
              time?: string;
              location?: string;
              free_event?: boolean | null;
              free_food?: boolean | null;
              external_registration_link?: string;
              poster_image?: string;
            };
          }>;
          scrapedEvents = allEvents
            .filter(
              (r) =>
                r.event?.is_event_like &&
                (r.event.confidence ?? 0) >= 0.7 &&
                r.event.event_title
            )
            .map((r) => ({
              sourceUrl: r.source_url,
              title: r.event!.event_title,
              description: r.event!.description,
              category: r.event!.category,
              date: r.event!.date,
              time: r.event!.time,
              location: r.event!.location,
              freeEvent: r.event!.free_event,
              freeFood: r.event!.free_food,
              registrationLink: r.event!.external_registration_link,
              bannerImage: r.event!.poster_image,
            }));
        } catch {
          /* events.json may not exist if pipeline failed early */
        }

        return NextResponse.json({
          ok: true,
          username,
          events: scrapedEvents,
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

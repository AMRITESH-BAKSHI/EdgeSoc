import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export async function POST(request: Request) {

  const body = await request.json();

  const { username } = body;

  const logPath = path.join(
    process.cwd(),
    "..",
    "logs",
    "website.log"
  );

  const logEntry =
    `[${new Date().toISOString()}] LOGIN_FAILED ip=127.0.0.1 username=${username}\n`;

  fs.appendFileSync(
    logPath,
    logEntry
  );

  // Run detector automatically
  exec(
  "python ../monitor/detector.py",
  async (error, stdout, stderr) => {

    if (error) {
      console.error(stderr);
      return;
    }

    console.log(stdout);

    if (stdout.includes("ALERT_CREATED")) {

      console.log("New alert detected. Starting investigation...");

      try {

        await fetch(
          "http://127.0.0.1:8000/investigate"
        );

      } catch (err) {

        console.error(err);

      }

    } else {

      console.log("No new alert. Investigation skipped.");

    }

  }
);

  return NextResponse.json({
    success: true
  });

}
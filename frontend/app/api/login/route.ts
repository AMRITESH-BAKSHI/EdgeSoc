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
 try {

    await fetch(
        "http://127.0.0.1:8000/detect",
        {
            method: "POST"
        }
    );

} catch (err) {

    console.error(err);

}

  return NextResponse.json({
    success: true
  });

}
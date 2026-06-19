import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {

  const body = await request.json();

  const { username, password } = body;

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

  return NextResponse.json({
    success: true
  });
}
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(
  request: Request
) {

  const body = await request.json();

  const query = body.query;

  const logPath = path.join(
    process.cwd(),
    "..",
    "logs",
    "website.log"
  );

  const logEntry =
    `[${new Date().toISOString()}] SQL_QUERY query=${query}\n`;

  fs.appendFileSync(
    logPath,
    logEntry
  );
  const requestLog =
  `[${new Date().toISOString()}] REQUEST ip=127.0.0.1\n`;

fs.appendFileSync(
  logPath,
  requestLog
);

  return NextResponse.json({
    success: true
  });
}
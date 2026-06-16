import { NextResponse } from "next/server";
import { fetchRecentB20Creations } from "@/lib/b20";

export async function GET() {
  const events = await fetchRecentB20Creations(50);

  return NextResponse.json({
    tokens: events.map((e) => ({
      ...e,
      blockNumber: e.blockNumber.toString(),
    })),
    count: events.length,
    network: process.env.NEXT_PUBLIC_NETWORK || "sepolia",
  });
}

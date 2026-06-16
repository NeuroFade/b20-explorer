import { NextRequest, NextResponse } from "next/server";
import { fetchB20Token } from "@/lib/b20";
import { getAddress } from "viem";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  let checksummed: `0x${string}`;
  try {
    checksummed = getAddress(address) as `0x${string}`;
  } catch {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }

  const token = await fetchB20Token(checksummed);

  if (!token) {
    return NextResponse.json({ error: "not a B20 token or not found" }, { status: 404 });
  }

  // Serialize bigints → string untuk JSON
  return NextResponse.json({
    ...token,
    totalSupply: token.totalSupply.toString(),
    supplyCap: token.supplyCap.toString(),
    multiplier: token.multiplier?.toString(),
    policies: {
      transferSender: token.policies.transferSender.toString(),
      transferReceiver: token.policies.transferReceiver.toString(),
      transferExecutor: token.policies.transferExecutor.toString(),
      mintReceiver: token.policies.mintReceiver.toString(),
    },
  });
}

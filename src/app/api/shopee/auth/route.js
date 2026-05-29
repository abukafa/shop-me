import { NextResponse } from "next/server";
import { shopee } from "@/services/shopee";

export async function GET() {
  const authUrl = shopee.getAuthUrl();
  return NextResponse.redirect(authUrl);
}

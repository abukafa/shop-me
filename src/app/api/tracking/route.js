import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopee } from "@/services/shopee";

export async function GET(request) {
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const order_sn = searchParams.get("order_sn");

  if (!order_sn) {
    return NextResponse.json(
      { error: "Parameter order_sn diperlukan" },
      { status: 400 },
    );
  }

  try {
    const shopeeToken = await prisma.shopeeToken.findFirst({
      where: { userId: decoded.id },
    });

    if (!shopeeToken) {
      return NextResponse.json(
        { error: "Shopee tidak terhubung" },
        { status: 400 },
      );
    }

    const tracking = await shopee.getTrackingInfo(
      shopeeToken.shopId,
      shopeeToken.accessToken,
      order_sn,
    );
    return NextResponse.json(tracking);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

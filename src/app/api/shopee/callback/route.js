import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopee } from "@/services/shopee";

export async function GET(request) {
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shopIdStr = searchParams.get("shop_id");

  if (!code || !shopIdStr) {
    return NextResponse.json(
      { error: "Parameter callback Shopee tidak lengkap" },
      { status: 400 },
    );
  }

  try {
    const tokenData = await shopee.getAccessToken(code, shopIdStr);

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error, message: tokenData.message },
        { status: 400 },
      );
    }

    await prisma.shopeeToken.upsert({
      where: { shopId: shopIdStr },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: decoded.id,
      },
      create: {
        shopId: shopIdStr,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userId: decoded.id,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard?connected=true", request.url),
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shopeeToken = await prisma.shopeeToken.findFirst({
      where: { userId: decoded.id },
    });

    if (!shopeeToken) {
      return NextResponse.json(
        { error: "Shopee tidak terhubung" },
        { status: 404 },
      );
    }

    const refreshData = await shopee.refreshToken(
      shopeeToken.shopId,
      shopeeToken.refreshToken,
    );

    if (refreshData.error) {
      return NextResponse.json(refreshData, { status: 400 });
    }

    const updated = await prisma.shopeeToken.update({
      where: { id: shopeeToken.id },
      data: {
        accessToken: refreshData.access_token,
        refreshToken: refreshData.refresh_token,
      },
    });

    return NextResponse.json({
      message: "Token berhasil di-refresh",
      updated: {
        shopId: updated.shopId,
        accessToken: updated.accessToken,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

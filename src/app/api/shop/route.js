import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopee } from "@/services/shopee";

export async function GET(request) {
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const decoded = await verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shopeeToken = await prisma.shopeeToken.findFirst({
      where: { userId: decoded.id },
    });

    if (!shopeeToken) {
      return NextResponse.json({
        error: "Shopee tidak terhubung",
        isConnected: false,
      });
    }

    let shopInfo = null;
    let isExpired = false;

    try {
      shopInfo = await shopee.getShopInfo(
        shopeeToken.shopId,
        shopeeToken.accessToken,
      );

      if (shopInfo?.error) {
        isExpired = true;
      }
    } catch (apiError) {
      console.error("Gagal memanggil getShopInfo Shopee:", apiError.message);
      // Jika request API gagal (misal token cacat/expired sehingga signature/auth ditolak Axios)
      isExpired = true;
    }

    // Jika belum expired tapi sudah lewat 4 jam, tetap set expired
    if (!isExpired && (Date.now() - new Date(shopeeToken.updatedAt).getTime() > 4 * 60 * 60 * 1000)) {
      isExpired = true;
    }

    return NextResponse.json({
      isConnected: true,
      shopInfo,
      shopId: shopeeToken.shopId,
      isExpired,
      updatedAt: shopeeToken.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ 
      isConnected: false, 
      error: error.message 
    });
  }
}

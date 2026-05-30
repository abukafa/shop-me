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

  const { searchParams } = new URL(request.url);
  const item_id_list = searchParams.get("item_id_list");

  if (!item_id_list) {
    return NextResponse.json(
      { error: "Parameter item_id_list diperlukan" },
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

    const detail = await shopee.getItemBaseInfo(
      shopeeToken.shopId,
      shopeeToken.accessToken,
      item_id_list,
    );
    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

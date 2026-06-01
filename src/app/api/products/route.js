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
      return NextResponse.json(
        { error: "Shopee tidak terhubung" },
        { status: 400 },
      );
    }

    const products = await shopee.getItemList(
      shopeeToken.shopId,
      shopeeToken.accessToken,
    );

    // Enrich products with details (name, stock, price, etc.)
    const itemIds = products?.response?.item?.map((i) => i.item_id) || [];
    let enrichedItems = [];
    
    if (itemIds.length > 0) {
      try {
        const details = await shopee.getItemBaseInfo(
          shopeeToken.shopId,
          shopeeToken.accessToken,
          itemIds,
        );
        const detailList = details?.response?.item_list || [];
        const detailMap = new Map(detailList.map((item) => [item.item_id, item]));

        enrichedItems = products.response.item.map((item) => {
          const detail = detailMap.get(item.item_id);
          return {
            ...item,
            item_name: detail?.item_name || "Nama Tidak Tersedia",
            price:
              detail?.price_info?.[0]?.current_price ??
              detail?.price_info?.current_price ??
              detail?.price ??
              0,
            stock:
              detail?.stock_info_v2?.summary_info?.total_available_stock ??
              detail?.stock_info_v2?.total_available_stock ??
              detail?.stock ??
              0,
            image:
              detail?.image?.image_url_list?.[0] ||
              detail?.image?.image_url ||
              detail?.image_url ||
              null,
          };
        });
      } catch (enrichError) {
        console.error("Gagal melakukan enrichment produk:", enrichError.message);
        enrichedItems = products.response.item;
      }
    }

    const responseData = {
      ...products,
      response: {
        ...products?.response,
        item: enrichedItems.length > 0 ? enrichedItems : (products?.response?.item || []),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const now = Math.floor(Date.now() / 1000);
    const threeDaysAgo = now - 3 * 24 * 60 * 60;

    const orders = await shopee.getOrderList(
      shopeeToken.shopId,
      shopeeToken.accessToken,
      threeDaysAgo,
      now,
    );

    // Enrich orders list with delivery details
    const orderList = orders?.response?.order_list || [];
    let enrichedOrders = [];
    
    if (orderList.length > 0) {
      try {
        const orderSns = orderList.map((o) => o.order_sn);
        const details = await shopee.getOrderDetail(
          shopeeToken.shopId,
          shopeeToken.accessToken,
          orderSns,
        );
        const detailedList = details?.response?.order_list || [];
        const detailedMap = new Map(detailedList.map((o) => [o.order_sn, o]));

        enrichedOrders = orderList.map((order) => {
          const detail = detailedMap.get(order.order_sn);
          return {
            ...order,
            recipient_name: detail?.recipient_address?.name || "Pembeli",
            phone: detail?.recipient_address?.phone || "-",
            shipping_carrier: detail?.shipping_carrier || "-",
            total_amount: detail?.total_amount || 0,
            payment_method: detail?.payment_method || "-",
            order_status: detail?.order_status || order.order_status || "UNPAID",
            update_time: detail?.update_time || order.update_time || Math.floor(Date.now() / 1000),
            item_list: detail?.item_list || [],
          };
        });
      } catch (enrichError) {
        console.error("Gagal melakukan enrichment pesanan:", enrichError.message);
        enrichedOrders = orderList;
      }
    }

    const responseData = {
      ...orders,
      response: {
        ...orders?.response,
        order_list: enrichedOrders.length > 0 ? enrichedOrders : orderList,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

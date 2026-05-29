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

    const orderListResponse = await shopee.getOrderList(
      shopeeToken.shopId,
      shopeeToken.accessToken,
      threeDaysAgo,
      now,
    );

    const orderList = orderListResponse?.response?.order_list || [];

    if (orderList.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        customers: [],
        orders: [],
      });
    }

    const orderSns = orderList.map((o) => o.order_sn);
    const orderDetailsResponse = await shopee.getOrderDetail(
      shopeeToken.shopId,
      shopeeToken.accessToken,
      orderSns,
    );

    const detailedOrders = orderDetailsResponse?.response?.order_list || [];

    const filteredOrders = detailedOrders.filter((order) => {
      const phone = order.recipient_address?.phone;
      return phone && phone.trim() !== "";
    });

    const customers = filteredOrders.map((order) => {
      const addr = order.recipient_address || {};
      const fullAddress =
        addr.full_address ||
        [addr.town, addr.district, addr.city, addr.state, addr.zipcode]
          .filter(Boolean)
          .join(", ");

      return {
        order_sn: order.order_sn,
        order_status: order.order_status,
        customer_name: addr.name || "Unknown",
        phone: addr.phone,
        full_address: fullAddress || "No address provided",
      };
    });

    return NextResponse.json({
      success: true,
      count: filteredOrders.length,
      customers,
      orders: filteredOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

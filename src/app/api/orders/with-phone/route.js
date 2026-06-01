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

    const customerMap = {};

    detailedOrders.forEach((order) => {
      // Group by buyer_user_id, with fallback to buyer_username or guest tracking
      const buyerId = order.buyer_user_id ? String(order.buyer_user_id) : (order.buyer_username || `guest_${order.order_sn}`);
      const addr = order.recipient_address || {};
      const phone = addr.phone || "";
      
      const fullAddress =
        addr.full_address ||
        [addr.town, addr.district, addr.city, addr.state, addr.zipcode]
          .filter(Boolean)
          .join(", ");

      if (!customerMap[buyerId]) {
        customerMap[buyerId] = {
          buyer_user_id: buyerId,
          buyer_username: order.buyer_username || "Unknown",
          customer_name: addr.name || "Unknown",
          phone: phone,
          full_address: fullAddress || "No address provided",
          total_spent: 0,
          total_orders: 0,
          orders: []
        };
      }

      // Aggregate spend and order count
      customerMap[buyerId].total_spent += order.total_amount || 0;
      customerMap[buyerId].total_orders += 1;
      
      // Save order details to the customer's shopping history
      customerMap[buyerId].orders.push({
        order_sn: order.order_sn,
        order_status: order.order_status,
        total_amount: order.total_amount || 0,
        create_time: order.create_time,
        shipping_carrier: order.shipping_carrier || "-",
        payment_method: order.payment_method || "-",
        items: order.item_list || []
      });
    });

    const customers = Object.values(customerMap);

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
      orders: detailedOrders,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopee } from "@/services/shopee";
import axios from "axios";

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

    const path = "/api/v2/order/get_order_detail";
    const ts = shopee.timestamp();
    const sign = shopee.sign(path, ts, shopeeToken.accessToken, shopeeToken.shopId);

    // List all optional sensitive and general fields to request from Shopee
    const optionalFields = [
      "buyer_user_id",
      "buyer_username",
      "recipient_address",
      "estimated_shipping_fee",
      "actual_shipping_fee",
      "actual_shipping_fee_confirmed",
      "payment_method",
      "shipping_carrier",
      "total_amount",
      "item_list",
      "package_list",
      "note",
      "note_update_time",
      "cancel_reason",
      "cancel_by",
      "pay_time",
      "dropshipper",
      "dropshipper_phone",
      "split_up",
      "buyer_cancel_reason",
      "fulfillment_flag",
      "pickup_done_time",
      "prescription_images",
      "prescription_check_status",
      "shipping_proof",
      "shipping_proof_status"
    ].join(",");

    const url =
      `${shopee.baseUrl}${path}` +
      `?partner_id=${shopee.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${shopeeToken.accessToken}` +
      `&shop_id=${shopeeToken.shopId}` +
      `&sign=${sign}` +
      `&order_sn_list=${order_sn}` +
      `&response_optional_fields=${optionalFields}`;

    const { data } = await axios.get(url);

    if (data.error) {
      return NextResponse.json(
        { error: data.error, message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

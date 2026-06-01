import crypto from "crypto";
import axios from "axios";

class ShopeeService {
  constructor() {
    this.partnerId = Number(process.env.SHOPEE_PARTNER_ID);
    this.partnerKey = process.env.SHOPEE_PARTNER_KEY;
    this.redirectUrl = process.env.SHOPEE_REDIRECT_URL;
    this.baseUrl =
      process.env.SHOPEE_BASE_URL || "https://partner.shopeemobile.com";
  }

  timestamp() {
    return Math.floor(Date.now() / 1000);
  }

  sign(path, timestamp, accessToken = "", shopId = "") {
    const base = `${this.partnerId}${path}${timestamp}${accessToken}${shopId}`;
    return crypto
      .createHmac("sha256", this.partnerKey)
      .update(base)
      .digest("hex");
  }

  getAuthUrl() {
    const path = "/api/v2/shop/auth_partner";
    const ts = this.timestamp();
    const sign = this.sign(path, ts);

    return (
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&sign=${sign}` +
      `&redirect=${encodeURIComponent(this.redirectUrl)}`
    );
  }

  async getAccessToken(code, shopId) {
    const path = "/api/v2/auth/token/get";
    const ts = this.timestamp();
    const sign = this.sign(path, ts);

    const { data } = await axios.post(
      `${this.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${ts}&sign=${sign}`,
      {
        code,
        shop_id: Number(shopId),
        partner_id: this.partnerId,
      },
    );

    return data;
  }

  async refreshToken(shopId, refreshToken) {
    const path = "/api/v2/auth/access_token/get";
    const ts = this.timestamp();
    const sign = this.sign(path, ts);

    const { data } = await axios.post(
      `${this.baseUrl}${path}?partner_id=${this.partnerId}&timestamp=${ts}&sign=${sign}`,
      {
        shop_id: Number(shopId),
        refresh_token: refreshToken,
        partner_id: this.partnerId,
      },
    );

    return data;
  }

  async getItemList(shopId, accessToken, offset = 0, pageSize = 50) {
    const path = "/api/v2/product/get_item_list";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}` +
      `&offset=${offset}` +
      `&page_size=${pageSize}` +
      `&item_status=NORMAL`;

    const { data } = await axios.get(url);
    return data;
  }

  async getOrderList(shopId, accessToken, timeFrom, timeTo) {
    const path = "/api/v2/order/get_order_list";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}`;

    const { data } = await axios.get(url, {
      params: {
        time_range_field: "create_time",
        time_from: timeFrom,
        time_to: timeTo,
        page_size: 20,
      },
    });

    return data;
  }

  async getShopInfo(shopId, accessToken) {
    const path = "/api/v2/shop/get_shop_info";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}`;

    const { data } = await axios.get(url);
    return data;
  }

  async getItemBaseInfo(shopId, accessToken, itemIdList) {
    const path = "/api/v2/product/get_item_base_info";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const itemIds = Array.isArray(itemIdList)
      ? itemIdList.join(",")
      : itemIdList;

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}` +
      `&item_id_list=${itemIds}`;

    const { data } = await axios.get(url);
    return data;
  }

  async getTrackingInfo(shopId, accessToken, orderSn) {
    const path = "/api/v2/logistics/get_tracking_info";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}` +
      `&order_sn=${orderSn}`;

    const { data } = await axios.get(url);
    return data;
  }

  async getOrderDetail(shopId, accessToken, orderSnList) {
    const path = "/api/v2/order/get_order_detail";
    const ts = this.timestamp();
    const sign = this.sign(path, ts, accessToken, shopId);

    const orderSns = Array.isArray(orderSnList)
      ? orderSnList.join(",")
      : orderSnList;

    const url =
      `${this.baseUrl}${path}` +
      `?partner_id=${this.partnerId}` +
      `&timestamp=${ts}` +
      `&access_token=${accessToken}` +
      `&shop_id=${shopId}` +
      `&sign=${sign}` +
      `&order_sn_list=${orderSns}` +
      `&response_optional_fields=recipient_address,shipping_carrier,total_amount,payment_method,item_list,buyer_username,buyer_user_id`;

    const { data } = await axios.get(url);
    return data;
  }
}

export const shopee = new ShopeeService();

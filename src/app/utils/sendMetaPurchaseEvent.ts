import * as bizSdk from "facebook-nodejs-business-sdk";
import config from "../config";
import { IOrder, IOrderItem } from "../modules/order/order.interface";
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const ServerEvent = bizSdk.ServerEvent;

bizSdk.FacebookAdsApi.init(config.meta_capi_access_token as string);

const buildMetaContents = (orderItems: IOrderItem[]) => {
  // or import type if available
  return orderItems.map((item) => {
    const content = new bizSdk.Content(); // ← Create SDK Content object

    content
      .setId(item.productId.toString())
      .setQuantity(item.quantity)
      .setItemPrice(item.finalPrice)
      .setTitle(item.name || "");

    return content;
  });
};

console.log(config.meta_capi_access_token, config.meta_pixel_id);

async function sendPurchaseEvent(order: IOrder, eventId: string) {
  if (!order?.fbc || !order.fbp) {
    return;
  }

  const content: bizSdk.Content[] = buildMetaContents(order.items);

  const userData = new UserData()
    .setEmail(order.userEmail) // will be auto-hashed by SDK
    .setPhone(order.userPhone) // if available
    .setFbp(order.fbp)
    .setFbc(order.fbc);
  // Optional but good

  if (order.clientIp) {
    userData.setClientIpAddress(order.clientIp);
  }
  if (order.clientUserAgent) {
    userData.setClientUserAgent(order.clientUserAgent);
  }

  const customData = new CustomData()
    .setValue(order.totalAmount)
    .setCurrency("BDT")
    .setContents(content) // array of {id, quantity, ...}
    .setContentType("product");

  const serverEvent = new ServerEvent()
    .setEventName("Purchase")
    .setEventTime(Math.floor(Date.now() / 1000)) // Unix timestamp
    .setEventId(eventId) // Critical for deduplication if you ever send browser too
    .setEventSourceUrl("https://gadgetgrid.live/checkout") // or dynamic
    .setActionSource("website")
    .setUserData(userData)
    .setCustomData(customData);

  const eventsData = [serverEvent];
  const eventRequest = new EventRequest(
    config.meta_capi_access_token,
    config.meta_pixel_id,
  )
    .setTestEventCode("") // remove for production; use for testing
    .setEvents(eventsData);

  try {
    const response = await eventRequest?.execute();
    console.log("CAPI Purchase sent:", response);
    return response;
  } catch (error) {
    console.error("CAPI Error:", error);
    // Log but don't block order confirmation
  }
}

export default sendPurchaseEvent;

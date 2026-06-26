import { Queue, Worker } from "bullmq";
import { RedisKeys } from "../../interface/common";
import { AddOrderPayload, IOrder } from "./order.interface";
import { Product } from "../product/product.model";
import { ProductJobName, productQueue } from "../product/product.queue";
import sendPurchaseEvent from "../../utils/sendMetaPurchaseEvent";
import Order from "./order.model";

const redisConnection = {
  connection: {
    url: process.env.REDIS_URL,
  },
};
export enum OrderJobName {
  updateProductStock = "updateProductStock",
  sendMetaPurchaseEvent = "sendMetaPurchaseEvent",
}

export const orderQueue = new Queue(RedisKeys.order, redisConnection);

const orderWorker = new Worker(
  RedisKeys.order,
  async (job) => {
    if (job.name === OrderJobName.updateProductStock) {
      const data = job.data as unknown as AddOrderPayload;

      await Promise.all(
        data.products.map(async (product) => {
          const productId = product.id;
          const quantity = product.quantity;

          const productDoc = await Product.findById(productId);

          if (!productDoc) return;

          if (productDoc.productType === "variant" && product.selectedVariant) {
            const variants = productDoc.variants?.map((v) => {
              const match = Object.entries(product.selectedVariant!).every(
                ([key, value]) =>
                  v.attributes[key] ===
                  (typeof value === "string" ? value : value.id),
              );
              const plain = JSON.parse(JSON.stringify(v));
              if (match) {
                return {
                  ...plain,
                  quantity: v.quantity - quantity,
                };
              }
              return plain;
            });

            await Product.findByIdAndUpdate(productId, {
              $set: { variants },
            });
          } else {
            await Product.findByIdAndUpdate(productId, {
              $inc: { quantity: -quantity },
            });
          }

          await productQueue.add(ProductJobName.updateSingleProduct, productId);
        }),
      );
    }

    if (job.name === OrderJobName.sendMetaPurchaseEvent) {
      const data = job.data as unknown as IOrder;
      const eventId = `purchase_${data?._id?.toString()}`;
      const sentEvent = await sendPurchaseEvent(data, eventId);

      if (sentEvent) {
        await Order.findByIdAndUpdate(data._id, {
          $set: {
            sentPurchaseEvent: true,
            eventId,
          },
        });
      }
    }
  },
  redisConnection,
);

orderWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});
orderWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`);
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderServices = exports.paymentWebhook = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = require("../product/product.model");
const order_utils_1 = require("./order.utils");
const order_model_1 = __importDefault(require("./order.model"));
const config_1 = __importDefault(require("../../config"));
const user_model_1 = require("../user/user.model");
const address_model_1 = __importDefault(require("../address/address.model"));
const sendOrderConfirmationMail_1 = __importDefault(require("../../templates/sendOrderConfirmationMail"));
const sendPaymentCofimationMail_1 = __importDefault(require("../../templates/sendPaymentCofimationMail"));
const notificaiton_utils_1 = require("../notification/notificaiton.utils");
const deals_model_1 = __importDefault(require("../deals/deals.model"));
const flashSale_model_1 = __importDefault(require("../flashSales/flashSale.model"));
let stripe = null;
try {
    stripe = require("stripe")(config_1.default.stripe_secret_key || "");
}
catch (err) {
    console.log(err);
}
const paymentWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const sig = req.headers["stripe-signature"];
    let event;
    const endpint_secret = config_1.default.stripe_enpoint_secret;
    if (!stripe || !endpint_secret) {
        return;
    }
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpint_secret);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const paymentData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.object;
            if (paymentData.payment_status === "paid") {
                try {
                    const options = {
                        paymentStatus: "paid",
                        paymentDetails: {
                            transactionId: paymentData.payment_intent,
                            paymentDate: new Date(),
                        },
                        totalAmount: ((paymentData === null || paymentData === void 0 ? void 0 : paymentData.amount_total) || 0) / 100,
                        currentStatus: "confirmed",
                    };
                    const res = yield order_model_1.default.findByIdAndUpdate(paymentData.client_reference_id, {
                        $set: options,
                        $push: {
                            statusHistory: [
                                {
                                    notes: "Order has been confirmed",
                                    status: "confirmed",
                                    timestamp: new Date(),
                                },
                            ],
                        },
                    }, { new: true });
                    if (res) {
                        try {
                            const thisUser = yield user_model_1.User.findOne({
                                email: (_b = paymentData === null || paymentData === void 0 ? void 0 : paymentData.metadata) === null || _b === void 0 ? void 0 : _b.userEmail,
                            });
                            if (!thisUser) {
                                return;
                            }
                            yield (0, sendPaymentCofimationMail_1.default)(thisUser, res);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
});
exports.paymentWebhook = paymentWebhook;
const addOrderToDB = (data, user, customer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const thisUser = yield user_model_1.User.findById(user);
    if (!thisUser) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Failed to create order");
    }
    const payload = {
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        paymentDetails: {
            transactionId: "",
        },
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        currentStatus: "pending",
        notes: (data === null || data === void 0 ? void 0 : data.notes) || "",
        statusHistory: [
            {
                status: "pending",
                timestamp: new Date(),
                notes: "Order placed successfully",
            },
        ],
        user: thisUser._id,
        orderNumber: yield (0, order_utils_1.generateOrderNumber)(order_model_1.default.find()),
    };
    const activeDeals = yield deals_model_1.default.find({ isActive: true });
    const activeSale = yield flashSale_model_1.default.findOne({ isActive: true });
    const products = yield product_model_1.Product.find({
        _id: { $in: (_a = data.products) === null || _a === void 0 ? void 0 : _a.map((p) => p.id) },
    }).lean();
    for (const pdt of data.products) {
        const exist = products.find((p) => p._id.toString() === pdt.id.toString());
        if (!exist) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Sorry, some products are not available");
        }
        if (exist.quantity < pdt.quantity) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Sorry, some products are not available");
        }
    }
    payload.items = products.map((p) => {
        var _a, _b, _c, _d;
        const orderProduct = data.products.find((op) => op.id.toString() === p._id.toString());
        const deal = activeDeals.find((d) => { var _a, _b; return ((_a = d._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = orderProduct === null || orderProduct === void 0 ? void 0 : orderProduct.offer) === null || _b === void 0 ? void 0 : _b.refId.toString()); });
        const hasSale = (orderProduct === null || orderProduct === void 0 ? void 0 : orderProduct.offer.type) === "flashSale" &&
            (activeSale === null || activeSale === void 0 ? void 0 : activeSale._id.toString()) === ((_a = orderProduct === null || orderProduct === void 0 ? void 0 : orderProduct.offer) === null || _a === void 0 ? void 0 : _a.refId.toString());
        const dealProduct = deal === null || deal === void 0 ? void 0 : deal.products.find((dp) => dp.productId.toString() === p._id.toString());
        const saleProduct = hasSale
            ? (_b = activeSale === null || activeSale === void 0 ? void 0 : activeSale.products) === null || _b === void 0 ? void 0 : _b.find((sp) => sp.productId.toString() === p._id.toString())
            : null;
        const discountCal = (0, order_utils_1.calculateDiscountPrice)(p.price, saleProduct
            ? saleProduct.discount
            : dealProduct
                ? dealProduct.discount
                : p.discount);
        return {
            name: p.name,
            productId: p._id,
            finalPrice: discountCal.discountPrice,
            quantity: ((_c = data.products.find((pd) => pd.id.toString() === p._id.toString())) === null || _c === void 0 ? void 0 : _c.quantity) || 1,
            shipping: p.shipping.free ? 0 : p.shipping.cost,
            tax: 0,
            image: p.thumbnail || ((_d = p.gallery) === null || _d === void 0 ? void 0 : _d[0]) || "",
            discountApplied: {
                discountValue: discountCal.discountAmount,
                description: deal === null || deal === void 0 ? void 0 : deal.title,
                type: deal ? "deal" : "product",
            },
            originalPrice: p.price,
        };
    });
    const totalItemsCost = payload.items.reduce((acc, item) => {
        return acc + item.finalPrice;
    }, 0);
    payload.shippingCost = payload.items.reduce((acc, item) => {
        return acc + item.shipping;
    }, 0);
    payload.taxAmount = payload.items.reduce((acc, item) => {
        return acc + item.tax;
    }, 0);
    payload.totalAmount =
        totalItemsCost + payload.shippingCost + payload.taxAmount;
    payload.subtotal = totalItemsCost;
    const order = yield order_model_1.default.create(payload);
    if (data.saveAddress) {
        try {
            const addressPayload = {
                user: thisUser._id,
                address: (_b = data.shippingAddress) === null || _b === void 0 ? void 0 : _b.address,
                city: (_c = data.shippingAddress) === null || _c === void 0 ? void 0 : _c.city,
                district: (_d = data.shippingAddress) === null || _d === void 0 ? void 0 : _d.district,
            };
            yield address_model_1.default.create(addressPayload);
        }
        catch (err) {
            console.log(err);
        }
    }
    for (const pdt of order.items) {
        yield product_model_1.Product.findByIdAndUpdate(pdt.productId, {
            $inc: { quantity: -pdt.quantity },
        });
    }
    if (order) {
        try {
            const notifications = yield (0, notificaiton_utils_1.buildNotifications)({
                actionType: "create",
                notificationType: "order",
                source: order.orderNumber,
                text: "added an order",
                thisUser: customer,
            });
            const notification = {
                notificationType: "order",
                actionType: "create",
                opened: false,
                userFrom: customer._id,
                userTo: customer === null || customer === void 0 ? void 0 : customer._id,
                source: String(order.orderNumber),
                text: `Order placed successfully`,
            };
            yield (0, notificaiton_utils_1.addNotifications)({
                notifications: [...notifications, notification],
                userFrom: customer,
            });
            yield (0, sendOrderConfirmationMail_1.default)(thisUser, order);
        }
        catch (err) {
            console.log(err);
        }
    }
    if (data.paymentMethod === "card") {
        if (!stripe) {
            return { order };
        }
        const session = yield stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                ...payload.items.map((item) => ({
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: item.name,
                            images: item.image ? [item.image] : [],
                        },
                        unit_amount: item.finalPrice * 100,
                    },
                    quantity: item.quantity,
                })),
                {
                    price_data: {
                        currency: "bdt",
                        product_data: { name: "Tax" },
                        //============================= need to add tax data=========================================================
                        unit_amount: Math.round(0 * 100),
                    },
                    quantity: 1,
                },
            ],
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: Math.round(order.shippingCost * 100),
                            currency: "bdt",
                        },
                        display_name: "Standard Shipping",
                    },
                },
            ],
            payment_intent_data: {
                description: `Order from Gadget Grid`, // Add company name to payment description
            },
            success_url: `${process.env.CLIENT_URL}/orders/${order.orderNumber}`,
            cancel_url: `${process.env.CLIENT_URL}/orders/${order.orderNumber}`,
            client_reference_id: order._id.toString(),
            metadata: {
                orderId: order._id.toString(),
                userEmail: thisUser.email,
                userRole: thisUser.role,
                company: "Gadget Grid",
            },
        });
        return {
            order,
            sessionId: session.url,
        };
    }
});
const getMyOrdersFromDB = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * 10;
    const orders = yield order_model_1.default.find({ user: userId }).skip(skip).limit(limit);
    return orders;
});
const getOrderByOrderNumberFormDB = (user, orderNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const result = order_model_1.default.findOne({ user, orderNumber });
    return result;
});
exports.OrderServices = {
    addOrderToDB,
    getMyOrdersFromDB,
    getOrderByOrderNumberFormDB,
};

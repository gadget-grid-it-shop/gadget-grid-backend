import { model, Schema } from "mongoose";
import { TAttribute, TAttributeOption } from "./attribute.interface";

const AttributeOptionSchema = new Schema<TAttributeOption>(
  {
    id: { type: String, required: true },
    isColor: { type: Boolean, default: false },
    value: { type: String, required: true },
    color: { type: String },
  },
  { _id: false },
);

const AttributeSchema = new Schema<TAttribute>(
  {
    title: { type: String, required: [true, "Attribute title is required"] },
    options: { type: [AttributeOptionSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Attribute = model<TAttribute>("Attribute", AttributeSchema);

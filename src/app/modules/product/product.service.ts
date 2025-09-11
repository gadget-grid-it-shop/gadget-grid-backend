import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import {
  defaultFields,
  TDiscount,
  THeader,
  TProduct,
  TProductCategory,
} from "./product.interface";
import { Product } from "./product.model";
import { TUser } from "../user/user.interface";
import slugify from "slugify";
import Papa from "papaparse";
import fs, { appendFile } from "fs";
import path from "path";
import { Category } from "../category/category.model";
import {
  buildProductQuery,
  claculateSpecialPrice,
  createCategoryArray,
  extractCommonFilters,
  ParsedFilters,
  parseFilters,
  transformSvgProductData,
} from "./product.utils";
import { Brand } from "../brand/brand.model";
import handleDuplicateError from "../../errors/handleDuplicateError";
import { TErrorSourse } from "../../interface/error.interface";
import { ObjectId } from "mongodb";
import { Error } from "mongoose";
import { TBulkUploadData } from "../bulkUpload/bulkUpload.interface";
import BulkUpload from "../bulkUpload/bulkUpload.model";
import QueryBuilder from "../../builder/queryBuilder";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import {
  addNotifications,
  buildNotifications,
} from "../notification/notificaiton.utils";
import ProductFilter from "../productFilters/filter.model";
import { TBrand } from "../brand/brand.interface";
import { TCategory } from "../category/category.interface";
import { getProductsFromRedis } from "./product.redis";
import sift from "sift";
import { ProductJobName, productQueue } from "./product.queue";

const createProductIntoDB = async (
  payload: TProduct,
  email: string,
  thisUser: TUser
) => {
  const user: TUser | undefined = await User.isUserExistsByEmail(email);

  if (!user._id) {
    throw new AppError(httpStatus.CONFLICT, "Could not find admin information");
  }

  const slug = slugify(payload.name);

  const productData = payload;
  productData.createdBy = user._id;
  productData.slug = slug;
  productData.mainCategory = productData.category?.find(
    (c) => c.main === true
  )?.id;

  if (payload.discount && payload.discount?.value > 0) {
    productData.special_price = claculateSpecialPrice(
      payload.discount,
      payload.price
    );
  }

  const result = await Product.create(productData);

  if (result) {
    if (!thisUser || !thisUser._id) {
      return;
    }

    const notifications = await buildNotifications({
      source: result._id,
      text: "added a product",
      thisUser,
      notificationType: "product",
      actionType: "create",
    });

    await addNotifications({ notifications, userFrom: thisUser });
  }

  return result;
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const searchFields = [
    "name",
    "model",
    "key_features",
    "description",
    "slug",
    "sku",
  ];
  const excludeFields = [
    "searchTerm",
    "page",
    "limit",
    "category",
    "sort",
    "fields",
  ];

  const pagination = {
    total: 0,
    currentPage: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  };

  const limit = pagination.limit;
  const skip = (pagination.currentPage - 1) * limit;

  if (query.category) {
    query.mainCategory = new ObjectId(query.category as string);
    delete query.categroy;
  }

  if (query.createdBy) {
    query.createdBy = new ObjectId(query.createdBy as string);
  }

  if (query.createdAt) {
    const startOfDay = dayjs(query.createdAt as string)
      .utc()
      .startOf("day")
      .toDate();
    const endOfDay = dayjs(query.createdAt as string)
      .utc()
      .endOf("day")
      .toDate();

    query.createdAt = {
      $gte: startOfDay,
      $lt: endOfDay,
    };
  }

  let result;

  const redisProducts = await getProductsFromRedis();

  if (!redisProducts || redisProducts?.length === 0) {
    const productQuery = new QueryBuilder(Product.find(), query)
      .search(searchFields)
      .filter(excludeFields)
      .sort()
      .fields();

    await productQuery.paginate();

    result = await productQuery.modelQuery
      .select("price discount name quantity thumbnail slug")
      .populate([
        {
          path: "brand",
          match: { _id: { $type: "objectId" } },
          select: "name image",
        },
        {
          path: "mainCategory",
          model: "Category",
        },
      ]);

    pagination.total = productQuery.total;

    await productQueue.add(ProductJobName.updateAllProducts, {});
  } else {
    const siftQuery: Record<string, any> = {};

    if (query.searchTerm) {
      siftQuery["$or"] = searchFields.map((field) => ({
        [field]: { $regex: query?.searchTerm, $options: "i" },
      }));
    }

    if (query.createdAt) {
      siftQuery["createdAt"] = query.createdAt;
    }

    console.log({ siftQuery });

    const filteredProducts = redisProducts.filter(sift(siftQuery));

    pagination.total = filteredProducts.length || 0;

    result = filteredProducts.slice(skip, skip + limit);
  }

  return {
    products: result,
    pagination,
  };
};

const getSingleProductFromDB = async (
  id: string,
  query: Record<string, any>
) => {
  if (!id) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Please provide product id to get details"
    );
  }

  let select = "";

  if (query?.select) {
    select = query.select.split(",").join(" ");
  }

  console.log({ select });

  const product = await Product.findById(id).select(select).lean();

  return product;
};
const getSingleProductBySlugFromDB = async (slug: string) => {
  if (!slug) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Please provide product id to get details"
    );
  }

  const product = await Product.findOne({ slug }).lean();

  const category = product?.mainCategory;

  const allCategories = await Category.find()
    .select("_id name slug parent_id image")
    .lean()
    .exec();
  const categoryMap = new Map(allCategories.map((c) => [c._id.toString(), c]));

  // Function to build category tree using pre-fetched categories
  const buildCategoryTree = (categoryId: string) => {
    const tree = [];

    let currentId = categoryId?.toString();
    while (currentId && categoryMap.has(currentId)) {
      const category = categoryMap.get(currentId);
      if (category) {
        tree.unshift({
          _id: category._id,
          name: category.name,
          slug: category.slug,
        });
        currentId = category.parent_id?.toString();
      }
    }

    // Log warning if a category or parent was not found
    if (currentId && !categoryMap.has(currentId)) {
      console.warn(`Parent category not found for ID: ${currentId}`);
    }

    return tree;
  };

  const breadcrum = buildCategoryTree(category?.toString() as string);

  const relatedProducts = await Product.find({
    "category.id": category,
  })
    .limit(8)
    .lean();

  return {
    product,
    relatedProducts: relatedProducts?.filter((p) => p._id !== product?._id),
    breadcrum,
  };
};

const bulkUploadToDB = async (
  file: Express.Multer.File | undefined,
  mapedFields: THeader[],
  email: string
) => {
  if (!file) {
    throw new AppError(httpStatus.CONFLICT, "No upload file provided");
  }

  const filePath = path.resolve(file.path);

  const categories = (await Category.find({ isDeleted: false }).lean()).map(
    (cat) => ({
      ...cat,
      _id: cat._id.toString(),
    })
  );
  const brands = (await Brand.find({ isDeleted: false }).lean()).map(
    (brand) => ({
      ...brand,
      _id: brand._id.toString(),
    })
  );
  const user: TUser | undefined = await User.isUserExistsByEmail(email);

  const payload: TProduct[] = await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const { data: csvData, errors: csvErrors } = result;

        if (csvErrors.length > 0) {
          reject(new AppError(httpStatus.CONFLICT, "Failed to read file"));
          return;
        }

        const filteredData: TProduct[] = [];

        for (const data of csvData) {
          const newData: Partial<TProduct> = {
            name: "",
            price: 0,
            special_price: 0,
            discount: {
              type: "percent",
              value: 0,
            },
            sku: "",
            brand: "",
            model: "",
            warranty: {
              days: 0,
              lifetime: false,
            },
            key_features: "",
            quantity: 0,
            category: [],
            description: "",
            videos: [],
            gallery: [],
            thumbnail: "",
            slug: "",
            attributes: [],
            meta: {
              title: "",
              description: "",
              image: "",
            },
            tags: [],
            isFeatured: true,
            mainCategory: "",
            shipping: {
              free: true,
              cost: 0,
            },
          };

          for (const field of mapedFields) {
            if (!field.key || !field.value) return;

            if (defaultFields.includes(field.value)) {
              const value =
                typeof data === "object" &&
                (data as Record<string, any>)[field.key];

              if (value !== undefined) {
                if (field.value === "category") {
                  const cat = categories.find(
                    (c) =>
                      c.name === (data as Record<string, any>)[field.key] ||
                      c._id === (data as Record<string, any>)[field.key]
                  );
                  if (cat) {
                    const productCat = createCategoryArray(categories, cat);
                    newData.category = productCat;
                    newData.mainCategory = cat._id;
                  }
                } else if (field.value === "shipping.cost") {
                  newData.shipping = newData.shipping || {
                    free: false,
                    cost: 0,
                  };
                  newData.shipping.cost = Number(value);
                } else if (field.value === "shipping.free") {
                  newData.shipping = {
                    free: String(value).toLowerCase() == "true" ? true : false,
                    cost: value == "true" ? 0 : newData.shipping?.cost || 0,
                  };
                } else if (field.value === "discount.type") {
                  newData.discount = newData.discount || {
                    type: "flat",
                    value: 0,
                  };
                  newData.discount.type = value;
                } else if (field.value === "discount.value") {
                  newData.discount = {
                    type: newData.discount?.type || "flat",
                    value: value,
                  };
                } else if (field.value === "meta.title") {
                  newData.meta = newData.meta || {
                    title: "",
                    description: "",
                    image: "",
                  };

                  newData.meta.title = value;
                } else if (field.value === "meta.description") {
                  newData.meta = newData.meta || {
                    title: "",
                    description: "",
                    image: "",
                  };

                  newData.meta.description = value;
                } else if (field.value === "meta.image") {
                  newData.meta = newData.meta || {
                    title: "",
                    description: "",
                    image: "",
                  };

                  newData.meta.image = value;
                } else if (field.value === "warranty.days") {
                  (newData.warranty = newData.warranty || {
                    days: 0,
                    lifetime: false,
                  }),
                    (newData.warranty.days = value);
                } else if (field.value === "warranty.lifetime") {
                  newData.warranty = newData.warranty || {
                    days: 0,
                    lifetime: false,
                  };
                  newData.warranty.lifetime =
                    String(value).toLowerCase() == "true" || "TRUE"
                      ? true
                      : false;
                } else if (field.value in newData) {
                  newData[field.value] = value;
                }

                if (field.value === "brand") {
                  const exist = brands.find(
                    (b) => b.name === value || b._id === value
                  );

                  if (exist) {
                    newData.brand = exist._id || "add brand";
                  }
                }

                newData.slug = slugify(newData.name as string);
                newData.sku = slugify(newData.name as string);
                newData.createdBy = user._id;
                newData.special_price = claculateSpecialPrice(
                  newData.discount as TDiscount,
                  Number(newData.price)
                );
              }
            }
          }

          filteredData.push(transformSvgProductData(newData) as TProduct);
        }

        resolve(filteredData);
      },
      error: (err) => {
        reject(
          new AppError(
            httpStatus.CONFLICT,
            `Error parsing file: ${err.message}`
          )
        );
      },
    });
  });

  if (payload.length === 0 || !payload) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Failed to parse data. Pelase map all the fields properly"
    );
  }

  const withError: {
    name: string;
    errorSources: TErrorSourse;
    data: TProduct;
  }[] = [];
  const successData: {
    name: string;
    slug: string;
    sku: string;
    _id: ObjectId;
  }[] = [];

  for (const record of payload) {
    try {
      const res = await Product.create(record);
      if (res) {
        successData.push({
          name: record.name,
          slug: record.slug,
          sku: record.sku,
          _id: res._id,
        });
      }
    } catch (err: any) {
      if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        withError.push({
          name: record.name,
          errorSources: simplifiedError.errorSources,
          data: record,
        });
      } else if (err instanceof Error.CastError) {
        withError.push({
          name: record.name,
          errorSources: [
            {
              path: err?.path,
              message: err.message || "Failed to create product",
            },
          ],
          data: record,
        });
      } else if (err instanceof Error.ValidationError) {
        const errorSources: TErrorSourse = [];
        Object.keys(err.errors).map((key) => {
          errorSources.push({
            path: key,
            message: err.errors[key].message,
          });
        });

        withError.push({
          name: record.name,
          errorSources,
          data: record,
        });
      } else {
        withError.push({
          name: record.name,
          errorSources: [
            {
              path: "",
              message: "Failed to create product",
            },
          ],
          data: record,
        });
      }
    }
  }

  try {
    const bulkResult = await BulkUpload.create({
      withError,
      successData,
      createdBy: user._id,
    });
  } catch (err) {
    // throw new AppError(httpStatus.CONFLICT, 'Failed to store bulk upload history')
  }

  const result: TBulkUploadData = {
    withError,
    successData,
    createdBy: user._id as ObjectId,
  };

  return result;
};

const updateProductIntoDB = async (
  id: string,
  payload: Partial<TProduct>,
  thisUser: TUser
) => {
  if (!id) {
    throw new AppError(httpStatus.FORBIDDEN, "Please provide product id");
  }

  const exist = await Product.findById(id);

  if (!exist) {
    throw new AppError(httpStatus.CONFLICT, "Product does not exist");
  }

  const result = await Product.findByIdAndUpdate(id, payload, { new: true });

  await productQueue.add(ProductJobName.updateSingleProduct, result?._id);

  if (result) {
    if (!thisUser || !thisUser._id) {
      return;
    }

    const notifications = await buildNotifications({
      source: result._id,
      text: "updated a product",
      thisUser,
      notificationType: "product",
      actionType: "update",
    });

    await addNotifications({ notifications, userFrom: thisUser });
  }

  return result;
};

const getFeaturedProductFromDB = async (queryLimit?: string) => {
  const limit = queryLimit ? Number(queryLimit) : 18;

  const products = await Product.find({ isFeatured: true })
    .sort("-updatedAt")
    .limit(Number(limit) || 18);

  return products;
};

const getProductByCategory = async (
  slug: string,
  query: Record<string, unknown>
) => {
  const catExist = await Category.findOne({ slug, isDeleted: false }).select(
    "_id slug name description"
  );

  const parsedFilters: ParsedFilters = parseFilters(query.filter as any);

  const pagination = {
    total: 0,
    currentPage: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  };

  if (!catExist) {
    throw new AppError(httpStatus.CONFLICT, "Category does not exist");
  }

  const categoryQuery = buildProductQuery(
    catExist._id.toString(),
    parsedFilters
  );

  // Get paginated products
  const products = await Product.find(categoryQuery)
    .select("price discount name quantity thumbnail slug shipping")
    .skip((pagination.currentPage - 1) * pagination.limit)
    .limit(pagination.limit)
    .lean();

  const total = await Product.countDocuments(categoryQuery);

  const allCategoryProducts = await Product.find({
    "category.id": catExist._id,
  })
    .select("filters")
    .lean();

  const commonFilters = extractCommonFilters(allCategoryProducts);

  let filters = [];

  for (let filter of commonFilters) {
    const data = await ProductFilter.findById(filter.filter);
    if (data) {
      filters.push(data);
    }
  }

  pagination.total = total;

  const allCategories = await Category.find()
    .select("_id name slug parent_id image")
    .lean()
    .exec();
  const categoryMap = new Map(allCategories.map((c) => [c._id.toString(), c]));

  // Function to build category tree using pre-fetched categories
  const buildCategoryTree = (categoryId: string) => {
    const tree = [];

    let currentId = categoryId?.toString();
    while (currentId && categoryMap.has(currentId)) {
      const category = categoryMap.get(currentId);
      if (category) {
        tree.unshift({
          _id: category._id,
          name: category.name,
          slug: category.slug,
        });
        currentId = category.parent_id?.toString();
      }
    }

    // Log warning if a category or parent was not found
    if (currentId && !categoryMap.has(currentId)) {
      console.warn(`Parent category not found for ID: ${currentId}`);
    }

    return tree;
  };

  const buildChildTree = (categoryId: string) => {
    const tree = [];
    const queue = [categoryId?.toString()];
    const visited = new Set();

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      visited.add(currentId);

      const category = categoryMap.get(currentId);
      if (!category) {
        console.warn(`Child category not found for ID: ${currentId}`);
        continue;
      }

      if (category._id.toString() !== catExist._id.toString()) {
        tree.push({
          _id: category._id,
          name: category.name,
          slug: category.slug,
          image: category.image,
          description: category?.description,
        });
      }

      // Find all children of the current category
      const children = allCategories.filter(
        (c) => c.parent_id?.toString() === currentId
      );
      queue.push(...children.map((c) => c._id.toString()));
    }

    return tree;
  };

  const categoryTree = buildCategoryTree(catExist._id.toString());
  const childTree = buildChildTree(catExist._id.toString());

  const data = {
    products,
    filters,
    categoryTree,
    childTree,
    category: catExist,
  };

  return {
    result: data,
    pagination,
  };
};

const getSearchProductsFromDB = async (query: Record<string, unknown>) => {
  const filters: any = {};
  const catFilters: any = {};
  const brandFilters: any = {};
  let sort: any = { createdAt: -1 };

  const getFrom = query.getFrom ? (query.getFrom as string)?.split(",") : [];

  if (query?.search) {
    filters["$or"] = [
      { name: { $regex: query.search, $options: "i" } },
      { model: { $regex: query.search, $options: "i" } },
    ];

    catFilters["$or"] = [{ name: { $regex: query.search, $options: "i" } }];
    brandFilters["$and"] = [{ isDeleted: false }];
    brandFilters["$or"] = [{ name: { $regex: query.search, $options: "i" } }];
    brandFilters["$and"] = [{ isDeleted: false }, { isActive: true }];
  }

  const products = await Product.find(filters)
    .select("slug _id name thumbnail")
    .sort(sort)
    .limit(15);

  let categories: TCategory[] = [];

  if (getFrom?.includes("category")) {
    categories = await Category.find(catFilters)
      .select("slug _id name description image")
      .sort(sort)
      .limit(10);
  }

  let brands: TBrand[] = [];

  if (getFrom?.includes("brand")) {
    brands = await Brand.find(brandFilters)
      .select("_id name image")
      .sort(sort)
      .limit(10);
  }

  return {
    products,
    categories,
    brands,
  };
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  bulkUploadToDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  getFeaturedProductFromDB,
  getProductByCategory,
  getSingleProductBySlugFromDB,
  getSearchProductsFromDB,
};

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { defaultFields, THeader, TProduct, TProductCategory } from "./product.interface";
import { Product } from "./product.model";
import { TUser } from "../user/user.interface";
import slugify from "slugify";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { Category } from "../category/category.model";
import { TCategory } from "../category/category.interface";
import { claculateSpecialPrice, createCategoryArray, transformSvgProductData } from "./product.utils";
import { Brand } from "../brand/brand.model";
import { TBrand } from "../brand/brand.interface";

const createProductIntoDB = async (payload: TProduct, email: string) => {

    const user: TUser | undefined = await User.isUserExistsByEmail(email)

    if (!user._id) {
        throw new AppError(httpStatus.CONFLICT, 'Could not find admin information')
    }

    const slug = slugify(payload.name)

    const productData = payload
    productData.createdBy = user._id
    productData.slug = slug

    if (payload.discount && payload.discount?.value > 0) {
        productData.special_price = claculateSpecialPrice(payload.discount, payload.price)
    }


    const result = await Product.create(productData)

    return result
}

const getAllProductsFromDB = async () => {
    const result = await Product.find().populate([
        {
            path: 'createdBy',
        },
        {
            path: 'brand',
            select: 'name image'
        },
        {
            path: 'category.id',
            model: 'Category',
            // match: { main: true },
            select: 'name'
        }
    ])

    return result
}


const bulkUploadToDB = async (file: Express.Multer.File | undefined, mapedFields: THeader[]) => {
    if (!file) {
        throw new AppError(httpStatus.CONFLICT, 'No upload file provided')
    }

    const filePath = path.resolve(file.path)

    const categories = await Category.find()

    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath)

        Papa.parse(fileStream, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const { data: csvData, errors } = result

                if (errors.length > 0) {
                    reject(new AppError(httpStatus.CONFLICT, 'Failed to read file'))
                    return
                }

                const filteredData = []

                for (const data of csvData) {
                    const newData: Partial<TProduct> = {
                        name: "",
                        price: 0,
                        special_price: 0,
                        discount: {
                            type: "percent",
                            value: 0
                        },
                        sku: "",
                        brand: "",
                        model: "",
                        warranty: {
                            days: 0,
                            lifetime: false
                        },
                        key_features: "",
                        quantity: 0,
                        category: [],
                        description: "",
                        videos: [],
                        gallery: [],
                        thumbnail: "",
                        slug: "",
                        attributes: [

                        ],
                        meta: {
                            title: "",
                            description: "",
                            image: ""
                        },
                        tags: [],
                        isFeatured: true,
                        shipping: {
                            free: true,
                            cost: 0
                        }
                    };


                    mapedFields.map(async (field: THeader) => {
                        if (!field.key || !field.value) return;

                        if (defaultFields.includes(field.value)) {
                            const value = typeof data === "object" && (data as Record<string, any>)[field.key]

                            if (value !== undefined) {
                                if (field.value === 'category') {
                                    const cat = categories.find(c => c.name === (data as Record<string, any>)[field.key])
                                    if (cat) {
                                        const productCat = createCategoryArray(categories, cat);
                                        newData.category = productCat
                                    }
                                }

                                else if (field.value === 'shipping.cost') {
                                    newData.shipping = newData.shipping || {
                                        free: false,
                                        cost: 0
                                    };
                                    newData.shipping.cost = Number(value);
                                }
                                else if (field.value === 'shipping.free') {
                                    newData.shipping = {
                                        free: value == 'true' ? true : false,
                                        cost: value == 'true' ? 0 : (newData.shipping?.cost || 0)
                                    };
                                }
                                else if (field.value === 'discount.type') {
                                    newData.discount = newData.discount || {
                                        type: 'flat',
                                        value: 0
                                    };
                                    newData.discount.type = value;
                                }

                                else if (field.value === 'discount.value') {
                                    newData.discount = {
                                        type: newData.discount?.type || 'flat',
                                        value: value
                                    };
                                }
                                else if (field.value === 'meta.title') {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: '',
                                        image: ''
                                    }

                                    newData.meta.title = value
                                }
                                else if (field.value === 'meta.description') {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: '',
                                        image: ''
                                    }

                                    newData.meta.description = value
                                }
                                else if (field.value === 'meta.image') {
                                    newData.meta = newData.meta || {
                                        title: "",
                                        description: '',
                                        image: ''
                                    }

                                    newData.meta.image = value
                                }

                                else if (field.value === 'warranty.days') {
                                    newData.warranty = newData.warranty || {
                                        days: 0,
                                        lifetime: false
                                    },

                                        newData.warranty.days = value
                                }

                                else if (field.value === 'warranty.lifetime') {
                                    newData.warranty = newData.warranty || {
                                        days: 0,
                                        lifetime: false
                                    },
                                        newData.warranty.lifetime = value
                                }

                                else if (field.value === 'brand') {
                                    const exist: TBrand | undefined | null = await Brand.findOne({ name: value })
                                    if (exist) {
                                        newData.brand = exist._id
                                    }
                                }

                                else {
                                    newData[field.value] = value;
                                }
                            }
                        }



                    })
                    // console.log(newData)

                    filteredData.push(transformSvgProductData(newData))
                }

                console.log(filteredData)

                // try {

                //     const res = await Product.insertMany(filteredData)
                //     console.log(res)
                // }
                // catch (err) {
                //     console.log(err)
                // }

                // resolve(res)
            },
            error: (err) => {
                reject(new AppError(httpStatus.CONFLICT, `Error parsing file: ${err.message}`));
            }
        },
        )
    },
    )

}

export const ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB,
    bulkUploadToDB
}

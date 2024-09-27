export interface TCrud {
    read: boolean,
    create: boolean,
    update: boolean,
    delete: boolean
}

export enum EAppFeatures {
    gallery = 'gallery',
    role = 'role',
    product = 'product',
    productDetails = 'productDetails',
    category = 'category',
    photo = 'photo'
}

export interface TPermission {
    feature: EAppFeatures,
    access: TCrud
}


export interface TRole {
    role: 'string',
    permissions: TPermission[]
}
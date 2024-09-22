

export interface TProductCategory {
    main: boolean,
    id: string
}


export interface TReview {
    rating: number,
    review: string
}

export interface TMeta {
    title: string,
    description: string,
    image: string
}

export interface TProduct {
    id: string;
    title: string;
    price: number;
    discount?: {
        type: string,
        value: 'flat' | 'percent'
    };
    product_SKU: string;
    brand: string;
    model?: string;
    warranty: string;
    reviews?: TReview[];
    key_features: string;
    quantity: number;
    category: TProductCategory[]; // Linked to Category
    description: string;
    videos?: string[];
    gallery?: string[];
    thumbnail: string;
    slug: string;
    attributes?: Record<string, string>;
    meta?: TMeta,
    tags?: string[]
    isFeatured?: boolean,
    sales?: number,
    createdBy: string
}
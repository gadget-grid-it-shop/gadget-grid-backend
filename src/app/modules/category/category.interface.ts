export interface TCategory {
  _id?: string;
  name: string;
  parent_id: string;
  product_details_categories: string[];
  subCategories?: TCategory[];
}

export interface TImage {
    image: string,
    height: number,
    width: number,
    size: number,
    extension: string,
    name: string
}

export interface TUploadImage {
    image_type: string,
    imageFile: File
}
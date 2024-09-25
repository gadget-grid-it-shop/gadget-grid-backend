import { GalleryFolder } from "./gallery.model";
import { TGalleryFolder } from "./gallery.interface";

const createGalleryFolderIntoDB = async (payload: TGalleryFolder) => {

    if (payload.parent_id) {
        const exist = await GalleryFolder.findById(payload.parent_id)

        if (!exist) {
            throw new Error('parent does not exist')
        }
    }

    const result = await GalleryFolder.create(payload)

    return result
}

const getFoldersFromDB = async (folder: string | null | undefined) => {

    const result = await GalleryFolder.find({ parent_id: folder })

    return result
}


export const GalleryFolderService = { createGalleryFolderIntoDB, getFoldersFromDB }
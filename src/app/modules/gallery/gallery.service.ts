import { GalleryFolder } from "./gallery.model";
import { TGalleryFolder } from "./gallery.interface";

const createGalleryFolderIntoDB = async (payload: TGalleryFolder) => {

    let parent_id: string | null = payload.parent_id || null

    if (payload.parent_id) {
        const exist = await GalleryFolder.findById(payload.parent_id)

        if (!exist) {
            throw new Error('parent does not exist')
        }
    }

    const result = await GalleryFolder.create({ name: payload.name, parent_id })

    return result
}

const getFoldersFromDB = async (folder: string | null) => {

    const parent_id = folder || null

    const result = await GalleryFolder.find({ parent_id })

    return result
}


export const GalleryFolderService = { createGalleryFolderIntoDB, getFoldersFromDB }
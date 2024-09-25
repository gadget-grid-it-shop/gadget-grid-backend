import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GalleryFolderService } from "./gallery.service";

const createGalleryFolder = catchAsync(async (req, res) => {
    const { parent_id, name } = req.body

    const result = await GalleryFolderService.createGalleryFolderIntoDB({ parent_id, name })

    sendResponse(res,
        {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Created new folder',
            data: result
        }
    )
})

const getFolders = catchAsync(async (req, res) => {
    const parent_id = (typeof req.query.parent_id === 'string' || req.query.parent_id === null)
        ? req.query.parent_id
        : null;

    const result = await GalleryFolderService.getFoldersFromDB(parent_id)

    sendResponse(res,
        {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Successfully retrived folders',
            data: result
        }
    )
})


export const GalleryFolderController = {
    createGalleryFolder,
    getFolders
}
import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { GalleryFolderValidatonSchema } from "./gallery.validation";
import { GalleryFolderController } from "./gallery.controller";

const router = Router()

router.post('/create-folder', validateRequest(GalleryFolderValidatonSchema.createGalleryFolderValidationSchema), GalleryFolderController.createGalleryFolder)
router.get('/get-folders', GalleryFolderController.getFolders)
router.patch('/update-folder/:id', GalleryFolderController.updateFolder)



export const galleryRoutes = router
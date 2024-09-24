import { Router } from "express";
import upload from "../../lib/image/image.multer";
import { ImageUploadController } from "./image.controller";

const router = Router()

router.post('/upload-image', upload.array('photos', 5), ImageUploadController.uploadImage)

router.get('/get-all', ImageUploadController.getAllImages)

router.delete('/delete-images', ImageUploadController.deleteImages)


export const ImageRoutes = router
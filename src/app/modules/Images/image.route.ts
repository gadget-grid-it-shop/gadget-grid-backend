import { Router } from "express";
import upload from "../../lib/image/image.multer";
import { ImageUploadController } from "./image.controller";

const router = Router()

router.post('/upload-image', upload.array('photos', 5), ImageUploadController.uploadImage)




export const ImageRoutes = router
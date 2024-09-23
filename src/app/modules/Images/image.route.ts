import { Router } from "express";
import upload from "../../lib/image/image.multer";
import { ImageUploadController } from "./image.controller";

const router = Router()

router.post('/upload-image', upload.single('image'), ImageUploadController.uploadImage)


export const ImageRoutes = router
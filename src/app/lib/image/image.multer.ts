import multer from 'multer'

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, '/gadgetGrid')
    }
})

const upload = multer({ storage: storage })

export default upload
import multer from "multer";
import cloudinary from "../config/cloudinary";

//configure multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

export { upload as multerUpload, cloudinary };

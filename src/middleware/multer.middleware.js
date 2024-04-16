import multer from "multer";

//temp config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Uploads will be stored in the public/temp
    },
    filename: function (req, file, cb) {
        cb(null,Date.now() + "-" + file.originalname);
    },
});

export const upload = multer({ storage });

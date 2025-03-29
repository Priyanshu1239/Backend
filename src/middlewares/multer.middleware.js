import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public'); // Ensure the './public' folder exists
    },
    filename: function (req, file, cb) { // 'ch' should be 'cb'
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });

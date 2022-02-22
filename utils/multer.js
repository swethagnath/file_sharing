const multer  = require('multer');
const path = require("path");

module.exports = multer({ 
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        cb(null, true)
    }
});
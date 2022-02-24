const multer  = require("multer");

module.exports = multer({ 
    storage: multer.diskStorage({}),
    limits: { fileSize:  1024 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
      const authorizedMimeTypes = ['image/jpg','image/jpeg','image/png','video/mp4'];
      if (authorizedMimeTypes.includes(file.mimetype)) {
        cb(null, true)
      }
      else{
        console.log("here")
        return cb(null, false);
      }
      
    }
});
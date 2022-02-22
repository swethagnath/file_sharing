const express = require('express');
const router  = express.Router();
const {cloudinary} = require('../utils/cloudinary');
const upload = require('../utils/multer');

router.post('/upload', upload.single('image'), async function (req, res, next) {
    try{
        const result = await cloudinary.uploader.upload(req.file.path);
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;
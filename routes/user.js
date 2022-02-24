const express = require("express");
const router  = express.Router();
const {cloudinary} = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {User} = require("../model/user");
const bcryptjs   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const requireLogin = require("../middlewares/requireLogin");
const {File} = require("../model/files");
const shortid = require("shortid");
const {emailSchema, uploadSchema} = require("../utils/validation");
const {AUTO} = require("../constant/common")

router.post("/signup", (req, res) => {

    const params =  {email, password} = req.body;

    const loginValidation = emailSchema.validate(params);
    const { error } = loginValidation;
    if (error) {
        return res.status(400).json({ message: "Invalid email/password", data: {format: ["password min 2 and max 10", "invalid email format"]}});
    }

    User
    .findOne({email})
    .then(savedUser => {
        if(savedUser) return res.status(400).json({error: "User already exists"});

        bcryptjs.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
            })
            user.save()
            .then(user => {
                res.status(201).json({message: "Created successfully"});
            })
            .catch(err => console.log(err))
        })
    })
    .catch(err => console.log(err))
        
});

router.post("/signin", (req, res) => {
    const params =  {email, password} = req.body;

    const loginValidation = emailSchema.validate(params);
    const { error } = loginValidation;
    if (error) {
        return res.status(400).json({ message: "Invalid email/password", data: {format: ["password min 2 and max 10", "invalid email format"]} });
    }

    User
    .findOne({email})
    .then(savedUser => {
        if(!savedUser) return res.status(400).json({error: "Invalid email/password"});
        bcryptjs.compare(password, savedUser.password)
        .then(doMatch => {
            if(!doMatch) res.status(400).json({error: "Invalid email/password"}); 
            
                let token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRATION_TIME
                });
                token = "Bearer " + token;
                return res.status(200).json({data: token, message: "Logged in successfully"});
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})


router.post("/upload", requireLogin, upload.single("image"), async (req, res) => {
    
    const params = {title, description} = req.query;

    const loginValidation = uploadSchema.validate(params);
    const { error } = loginValidation;
    if (error) {
        return res.status(400).json({ error: "Incomplete Fields" });
    }
    
    if(!req.file) res.status(400).json({error: "Invalid file path", data: "only image/jpg,image/jpeg,image/png,video/mp4"}); 

    try{
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {resource_type: AUTO, quality: AUTO});
        const cloudinary_id = cloudinaryResponse.secure_url;
        const file = new File({
            file_name:req.file.originalname,
            title,
            description,
            cloudinary_id,
            user_id: req.user._id,
        });
        file.save()
        .then(() => {
            return res.status(201).json({message: "Created successfully"});
        }) 
        .catch(err => res.status(400).json({message: err}))
    }
    catch(err){
        res.status(400).json({message: err})
    }
});

router.get("/files", requireLogin, async (req, res) => {

    File
    .find({user_id: req.user._id})
    .then(file => {
        res.status(200).json({ message: "Retrived successfully", data: file });
    })
    .catch(err => console.log(err))

});

router.delete("/file/:fileId", requireLogin, (req, res) => {

    File
    .findById({_id:req.params.fileId})
    .then(file => {
        if(file.user_id.toString() == req.user._id.toString()){
            file.remove()
            .then(() => {
                res.status(200).json({ message: "Deleted successfully" })
            })
            .catch(err => {
                return res.status(400).json({ error: err });
            })
        }else{
            return res.status(400).json({ error: "File dosent exist" });
        }    
    })
    .catch(() => {
        return res.status(400).json({ error: "File doesnt exist" });
    })
})

router.put("/file/:fileId", requireLogin, upload.single("image"), (req, res) => {
    
    const params = {title, description} = req.query;

    const loginValidation = uploadSchema.validate(params);
    const { error } = loginValidation;
    if (error) {
        return res.status(400).json({ error: "Incomplete Fields" });
    }

    if(!req.file) res.status(400).json({error: "Invalid file path", data: "only image/jpg,image/jpeg,image/png,video/mp4"}); 

    File
    .findById({_id:req.params.fileId})
    .then(async file => {
        if(req.file.originalname != file.file_name){
            let result = await cloudinary.uploader.upload(req.file.path, {resource_type: AUTO, quality: AUTO});
            file.cloudinary_id = result.secure_url;
            file.file_name = req.file.originalname;
        }
        file.title = title;
        file.description = description;
        file.save()     
        .then(result => {   
            if (result) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json({ error: "err" });
            }
        })
        .catch(err => res.status(400).json({ error: err }))     
    })
    .catch(() => res.status(400).json({ error: "File doesnot exist" }))  
})


router.post("/file/:fileId", requireLogin, (req, res) => {
    const baseUrl = "http:localhost:5000/user/file";
    const urlCode = shortid.generate();
    const shortUrl = baseUrl + "/" + urlCode;

    File.findByIdAndUpdate(req.params.fileId, {$set:{url_code:urlCode, short_url:shortUrl}}, {upsert:true})
    .then(file => {
        return res.status(201).json({message: "Created sucessfuly", data: {shortUrl}});
    })
    .catch(err => res.status(400).json({ error: "File doesnot exist" }))
})

router.get("/file/:urlCode", (req, res) => {
    const urlCode = req.params.urlCode;
    File.findOne({url_code:urlCode})
    .then(file => {
        return res.status(200).redirect(file.cloudinary_id);
    })
    .catch(err => res.status(400).json({ error: "File doesnot exist" }))
})


module.exports = router;
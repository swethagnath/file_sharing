const express = require("express");
const router  = express.Router();
const {cloudinary} = require("../utils/cloudinary");
const upload = require("../utils/multer");
const {User} = require("../model/user");
const bcryptjs   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const requireLogin = require("../middlewares/requireLogin");
const mongoose = require("mongoose");
const {File} = require("../model/files");
const shortid = require('shortid');


router.post("/signup", (req, res) => {

    const {email, password} = req.body;
    if(!email || !password){
        return res.status(422).json({err: "please add all the fields"});
    }

    User
    .findOne({email})
    .then(savedUser => {
        if(savedUser) return res.status(422).json({error: "user already exists with that email"});

        bcryptjs.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                password: hashedPassword,
            })
            user.save()
            .then(user => {
                res.json({message: "saved successfully"})
            })
            .catch(err => console.log(err))
        })
    })
    .catch(err => console.log(err))
        
})

router.post("/signin", (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) return res.json({error: "please add email or password"})
    User.findOne({email})
    .then(savedUser => {
        if(!savedUser) return res.json({error: "please add email"});
        bcryptjs.compare(password, savedUser.password)
        .then(doMatch => {
            const token = jwt.sign({_id: savedUser._id}, process.env.JWT_SECRET);
            return res.json({token, message: "successfully signed in"});
        })
    })
})


router.post("/upload", requireLogin, upload.single("image"), async (req, res) => {
    
    const {title, description} = req.query;
    const details = {
        title,
        description
    }

    try{
        const result = await cloudinary.uploader.upload(req.file.path, {resource_type: "auto", quality: "auto"});
        const cloudinary_id = result.secure_url;
        const file = new File({
            title,
            description,
            cloudinary_id,
            user_id: req.user._id,
        });

        file.save()
        .then(result => {
            return res.json({message: "successfully created"});
        }) 
        .catch(err => console.log(err))
    }
    catch(err){
        console.log(err);
    }
});

router.get("/files", requireLogin, async (req, res) => {
    File.find({user_id:req.user._id})
    .populate("user_id")
    .then(file => {
        res.json({ file })
    })
    .catch(err => console.log(err))
});

router.delete("/file/:fileId", requireLogin, (req, res) => {
    File.findById({_id:req.params.fileId})
    .then(file => {
        if (!file) {
            return res.status(400).json({ error: "err" })
        }
        if(file.user_id.toString() == req.user._id.toString()){
            file.remove()
            .then(result => {
                console.log(result)
                res.status(400).json({ error: "user dosent exist" })
            })
            .catch(err => {
                console.log(err)
            })
        }else{
            return res.status(400).json({ error: "user dosent exist" })
        }
        
    })
})

router.put("/file/:fileId", requireLogin, upload.single("image"), (req, res) => {
    const {title, description, cloudinary_id} = req.query;
    File.findById({_id:req.params.fileId})
    .then(async file => {
        let result;
        if(file.cloudinary_id != cloudinary_id){
            result = await cloudinary.uploader.upload(req.file.path, {resource_type: "auto", quality: "auto"});
            file.cloudinary_id = result.secure_url
        }
        file.title = title;
        file.description = description;
        file.save()     
        .then(result => {   
            if (result) {
                return res.json(result);
            } else {
                return res.json({ error: "err" });
            }
        })
        .catch(err => console.log(err))     
    })
})


router.post('/file/:fileId', requireLogin, (req, res) => {
    const baseUrl = "http:localhost:5000/user/file";
    const urlCode = shortid.generate();
    const shortUrl = baseUrl + '/' + urlCode;

    File.findByIdAndUpdate(req.params.fileId, {$set:{url_code:shortid.generate(), short_url:shortUrl}}, {upsert:true})
    .then(file => {
        return res.json({shortUrl, urlCode});
    })
    .catch((err) => console.log(err))
})

router.get('/file/:urlCode', (req, res) => {
    const urlCode = req.params.urlCode;
    File.findOne({urlCode})
    .then(file => {
        return res.redirect(file.cloudinary_id)
    })
})


module.exports = router;
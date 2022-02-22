const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    file: [{
        type: String,
        details: {
            title: String,
            description: String
        },
        cloudinary_id: String
    }]
    
});

mongoose.model("User", userSchema); 
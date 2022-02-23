const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types

const fileSchema = new mongoose.Schema({
    title: {
       type: String
    },
    description: {
        type: String
    },
    cloudinary_id: {
        type: String
    },
    user_id: {
        type: ObjectId, 
        ref: "User"
    },
    url_code:{
        type: String,
    },
    short_url: {
        type: String,
    }
});

const File = mongoose.model("File", fileSchema); 

module.exports = { 
    File 
};
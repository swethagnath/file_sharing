const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const fileSchema = new mongoose.Schema({
    title: {
       type: String,
       required: true
    },
    description: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String,
        required: true
    },
    user_id: {
        type: ObjectId, 
        ref: "User"
    },
    file_name: {
        type: String
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
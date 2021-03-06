const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const { User } = require("../model/user");

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "you must be logged in" });
    }
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: err });
        }

        const { _id } = payload;
        User.findById(_id)
            .then(userdata => {
                if (userdata) {
                    req.user = userdata;
                    next();
                } else {
                    return res.status(401).json({ error: "user doesnt exist" });
                }

            })
    })

};

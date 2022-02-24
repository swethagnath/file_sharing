const { validate, ValidationError, Joi } = require('express-validation');

const emailSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(2).max(10).required()
});

const uploadSchema = Joi.object().keys({
    title: Joi.required(),
    description: Joi.required()
});

module.exports = {
    emailSchema,
    uploadSchema
};
let mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: Number,
        required: true
    }
})

module.exports = { urlSchema }
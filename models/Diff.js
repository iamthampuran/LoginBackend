const mongoose = require('mongoose')
const Schema = mongoose.Schema

const diffSchema = new Schema({
    email: String,
    type: String
})

const Differ = mongoose.model('Type',diffSchema)

module.exports = Differ

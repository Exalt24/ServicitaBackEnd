const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    serviceId: String,
    postText: String,
    images: [String],
    createdAt: Date,
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post; 
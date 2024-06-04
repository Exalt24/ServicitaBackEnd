const Post = require('./model');

const createPost = async (serviceId, postText, images) => {
    try {
        const newPost = await Post.create({
            serviceId,
            postText,
            images,
            createdAt: new Date(),
        });
        return newPost;
    } catch (error) {
        throw error;
    }
}

const getPostsById = async (serviceId) => {
    try {
        const posts = await Post.find({ serviceId });
        return posts;
    } catch (error) {
        throw error;
    }
}

const deletePost = async (postId) => {
    try {
        const post = await Post.findByIdAndDelete(postId);
        return post;
    } catch (error) {
        throw error;
    }
}

module.exports = { createPost, getPostsById, deletePost };

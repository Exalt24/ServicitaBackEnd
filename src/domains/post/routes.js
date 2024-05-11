const express = require('express');
const router = express.Router();
const { createPost, getPostsById } = require('./controller');

router.post('/createPost', async (req, res) => {
    try {
        const { serviceId, postText, images } = req.body;
        const newPost = await createPost(serviceId, postText, images);
        res.status(200).json({
            status: "SUCCESS",
            message: "Post created successfully.",
            data: newPost
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

router.post('/getPostsById', async (req, res) => {
    try {
        const { serviceId } = req.body;
        const posts = await getPostsById(serviceId);
        res.status(200).json({
            status: "SUCCESS",
            message: "Posts fetched successfully.",
            data: posts
        });
    } catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
})

module.exports = router;
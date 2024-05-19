const express = require('express');
const router = express.Router();
const { generateSeekerContent, generateProviderContent } = require('./controller');

router.post('/generateSeekerContent', async (req, res) => {
    const { inputText } = req.body;
  
    try {
      const outputText = await generateSeekerContent(inputText);
      res.status(200).json({ outputText });
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: error.message });
      
    }
  });

router.post('/generateProviderContent', async (req, res) => {
    const { inputText } = req.body;
  
    try {
      const outputText = await generateProviderContent(inputText);
      res.status(200).json({ outputText });
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: error.message });
    }
  });


module.exports = router;
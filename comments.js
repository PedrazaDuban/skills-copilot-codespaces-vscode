// create web server for comments
const express = require('express');
const router = express.Router();

// create route for /comments
router.get('/', (req, res) => {
    res.send('Comments');
});

// export router
module.exports = router;
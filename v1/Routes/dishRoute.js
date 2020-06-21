const express = require('express');
const router = express.Router();
const dish_controller = require('../Controllers/dishController')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})

router.get('/', dish_controller.get_all_dishes)

router.get('/:id', dish_controller.get_dishes_by_ID)

router.post('/', upload.single('dishImage'), dish_controller.add_dish)



module.exports = router;
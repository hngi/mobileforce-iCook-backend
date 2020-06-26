const express = require('express');
const router = express.Router();
const dish_controller = require('../Controllers/dishController')


router.post('/', dish_controller.createDish);

router.get('/', dish_controller.get_all_dishes)

router.get('/:id', dish_controller.get_dishes_by_ID)





module.exports = router;
const Dish = require("../../Models/dishModel");
const uploadImage = require("../../Database/uploadImage");
const Profile = require("../../Models/profileModel");
const User = require('../../Models/authModel');
const PublicResponse = require('../../Helpers/model');

exports.createDish = async(req, res, next) => {
  try{
    const{
      name,
      recipe,
      healthBenefits,
      ingredients,
    } = req.body;

    const userId = req.user._id;

    const dish = new Dish({
      name: name,
      recipe: recipe,
      healthBenefits: healthBenefits,
      ingredients: ingredients,
      chefId: userId
    });

    const findProfile = await User.findById(userId).populate('profile');

    const profileId = findProfile.profile[0]._id

    await Profile.findByIdAndUpdate(profileId, {$push: { dishes: dish}}, {new: true, useFindAndModify: false });
    await dish.save();
    return res.status(201).json({
      status: "success",
      error: "",
      message: "dish saved successfully!",
      data: {
        dish
      }
    });

  }
  catch(error){
    res.status(400).json({
      status: "fail",
      error: error.message
    })
  }
}

exports.get_all_dishes = async (req, res, next) => {
  try {
    const me = await Profile.findOne({
      userId: req.user._id
    });
    const {lastSync, size=15, after} = req.query;
    const date = lastSync ? new Date(req.query.lastSync) : new Date().setDate(new Date().getDate() - 3);
    const _dishes = await Dish.find({
      $or: [
        {
          'chefId': {
            $in: me.following.map(id => mongoose.Types.ObjectId(id.toString())),
          }
        },
        {
          'chefId': req.user._id
        }
      ],
      $and: [
        {
          $or: [
            {
              'createdAt': {
                $gte: date 
              }
            },
            {
              'updatedAt': {
                $gte: date 
              }
            }
          ]
        }
      ]
    });
    const isFavourite = id => ({ isFavourite: me.favourites.includes(id) });
    const dishes = PublicResponse.dishes(_dishes, req, isFavourite); 
    let foundIndex = 0;
    let paginated = [];

    if (after) {
      foundIndex = dishes.findIndex(d => d._id.toLocaleString() === after.toLocaleString());
      if (foundIndex >= 0) {
        const start = foundIndex + 1;
        paginated = dishes.slice(start, start + Number(size));
      }
    } else {
      paginated = dishes.slice(foundIndex, Number(size));
    }

    const last = paginated[paginated.length - 1];
    const lastToken = last ? last._id : null;

    return res.status(200).json({
      status: "success",
      error: "",
      data: {
        total: dishes.length,
        count: paginated.length,
        dishes: paginated,
        after: lastToken
      }
    })
  } 
  catch (error) {
    return res.status(404).json({
      status: "fail",
      error: error.message
    })
  }
};

exports.get_dishes_by_ID = async (req, res, next) => {
  try{
    const dish = await Dish.findById(req.params.id);
    if(dish){
      const me = await Profile.findOne({
        userId: req.user._id
      });
      const isFavourite = me.favourites.includes(req.params.id);
      const d = PublicResponse.dish(dish, req, { isFavourite }); 
      res.status(200).json({
        status: "success",
        error: "",
        data: {
          dish: d
        }
      });
    } else {
      throw new Error('Not found');
    }
  } catch(error){
      return res.status(404).json({
        status: "fail",
        error: `dish with ID ${req.params.id} not found`
      })
  }
};

// Delete operation should be idempotent
// @Usman Jun 27
exports.delete_dish = async (req, res, next) => {
  try {
    const dish = await Dish.findOne({_id: req.params.id});
    if (!dish) {
      throw new Error('Not found');
    }

    if (dish.chefId.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized');
    }
    const data = await Dish.deleteOne({_id: req.params.id});
    res.status(200).json({
      status: "success",
      error: "",
      data
    });
  } catch(error) {
    const code = error.message === 'Unauthorized' ? 403 : 400;
    return res.status(code).json({
      status: "fail",
      error: error.message
    });
  }
};

// @Usman - Jun 27 12:02
exports.toggle_like = async (req, res) => {
  try {
    const dish = await Dish.findOne({_id: req.params.id});
    if (!dish) {
      throw new Error('Not found');
    }
    const userId = req.user._id.toString();
    const isLiked = dish.likes.includes(userId);
    if (isLiked) {
      dish.likes = dish.likes.filter(id => userId !== id);
    } else {
      dish.likes.push(userId);
    }
    await dish.save();
    const d = PublicResponse.dish(dish, req); 
    res.status(200).json({
      status: "success",
      error: "",
      data: {
        dish: d 
      }
    });
  } catch(error) {
    const code = error.message === 'Not found' ? 404 : 400;
    return res.status(code).json({
      status: "fail",
      error: error.message
    });
  }
};

// @Usman Jun 27
exports.toggle_favorite = async (req, res) => {
  try {
    const dishId = req.params.id;
    const dish = await Dish.findOne({_id: dishId});
    if (!dish) {
      throw new Error('Not found');
    }
    const me = await Profile.findOne({
      userId: req.user._id
    });
    const isFavorite = me.favourites && me.favourites.includes(dishId);

    if (isFavorite) {
      me.favourites = me.favourites.filter(id => id.toString() !== dishId);
    } else {
      me.favourites.push(dishId);
    };
    me.save();

    return res.status(200).json({
      status: 'success',
      error: '',
      data: {
        dish: PublicResponse.dish(dish, req, {isFavorite: !isFavorite})
      }
    });
  } catch(error) {
    return res.status(400).json({
      status: 'fail',
      error: error.message
    });
  }
};

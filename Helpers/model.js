// public response

// @Usman Jun 27
exports.dish = (dish, req) => {
  const d = Object.assign({}, {
    ...dish.toJSON(),
    commentsCount: dish.comments ? dish.comments.length : 0,
    likesCount: dish.likes.length,
    isLiked: dish._isLiked(req.user._id)
  });
  delete d.likes;
  delete d.comments;
  return d;
};

// @Usman Jun 27
exports.dishes = (_dishes, req) => {
  const dishes = _dishes.map(dish => {
    const d = Object.assign({}, {
      ...dish.toJSON(),
      likesCount: dish.likes.length,
      isLiked : dish._isLiked(req.user._id)
    });
    delete d.likes;
    delete d.comments;
    return d;
  });
  return dishes;
};
// public response

// @Usman Jun 27
function _dish(dish, req, extraData={}) {
  const d = Object.assign({}, {
    ...dish.toJSON(),
    commentsCount: dish.comments ? dish.comments.length : 0,
    likesCount: dish.likes.length,
    isLiked: dish._isLiked(req.user._id)
  },extraData);
  delete d.likes;
  delete d.comments;
  return d;
};


// @Usman Jun 27
function _user(user, req) {
  const userId = user._id.toString(); 
  const me = user.userId.includes(req.user._id.toString());
  const _user = Object.assign({}, {
    ...user.toJSON(),
    followersCount: user.followers ? user.followers.length : 0,
    followingCount: user.following ? user.following.length : 0,
    dishesCount: user.dishes ? user.dishes.length : 0,
    isFollowing: user._isFollowing(userId),
    me
  });
  delete _user.followers;
  delete _user.following;
  delete _user.dishes;
  delete _user.favDishes;
  delete _user.favourites;
  return _user;
};

// @Usman Jun 27
exports.users = (_users, req) => _users.map(u => _user(u, req));
exports.dishes = (_dishes, req, fn=() => ({})) => _dishes.map(d => _dish(d, req, fn(d._id.toString())));
exports.dish = _dish;
exports.user = _user;
// public response

// @Usman Jun 27
function _dish(dish, req) {
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
exports.dish = _dish;

// @Usman Jun 27
exports.dishes = (_dishes, req) => _dishes.map(d => _dish(d, req));

// @Usman Jun 27
function _user(user, req) {
  const userId = req.params.id; 
  const _user = Object.assign({}, {
    ...user.toJSON(),
    followersCount: user.followers ? user.followers.length : 0,
    followingCount: user.following ? user.following.length : 0,
    dishesCount: user.dishes ? user.dishes.length : 0,
    isFollowing: user._isFollowing(userId),
    me: userId === req.user._id.toString()
  });
  delete _user.followers;
  delete _user.following;
  return _user;
};
exports.user = _user;

// @Usman Jun 27
exports.users = (_users, req) => _users.map(u => _user(u, req));
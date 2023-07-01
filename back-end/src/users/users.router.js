const router = require("express").Router({ mergeParams: true });
const controller = require("./users.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/login").post(controller.login).all(methodNotAllowed);
router.route("/:user_id/logout").get(controller.logout).all(methodNotAllowed);
router
  .route("/:user_id/password")
  .put(controller.updatePassword)
  .all(methodNotAllowed);
router
  .route("/:user_id/friends/:friend_id")
  .delete(controller.removeFriend)
  .all(methodNotAllowed);
router
  .route("/:user_id/friends")
  .get(controller.listFriends)
  .post(controller.addFriend)
  .all(methodNotAllowed);
router
  .route("/:user_id")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);
router.route("/").post(controller.create).all(methodNotAllowed);

module.exports = router;

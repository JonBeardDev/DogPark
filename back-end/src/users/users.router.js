const router = require("express").Router({ mergeParams: true });
const controller = require("./users.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const multer = require("multer");

const upload = multer({
  dest: "images/users/",
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      // Reject the file with an error, if not image type
      return cb(new Error("Only image files are allowed."));
    }
    // Otherwise accept the file
    cb(null, true);
  },
});

router.route("/login").post(controller.login).all(methodNotAllowed);
router.route("/:user_id/logout").get(controller.logout).all(methodNotAllowed);
router
  .route("/:user_id/password")
  .put(controller.updatePassword)
  .all(methodNotAllowed);
router
  .route("/:user_id/friends/:friend_id")
  .post(controller.addFriend)
  .delete(controller.removeFriend)
  .all(methodNotAllowed);
router
  .route("/:user_id/friends")
  .get(controller.listFriends)
  .all(methodNotAllowed);
router
  .route("/:user_id/image")
  .get(controller.getImage)
  .post(upload.single("image"), controller.addImage)
  .put(upload.single("image"), controller.updateImage)
  .delete(controller.removeImage);
router
  .route("/:user_id")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);
router
  .route("/")
  .get(controller.search)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;

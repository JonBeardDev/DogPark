const router = require("express").Router({ mergeParams: true });
const controller = require("./dogs.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const multer = require("multer");

const upload = multer({
  dest: "images/dogs/",
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      // Reject the file with an error, if not image type
      return cb(new Error("Only image files are allowed."));
    }
    // Otherwise accept the file
    cb(null, true);
  },
});

router
  .route("/:dog_id/image")
  .get(controller.getImage)
  .post(upload.single("image"), controller.addImage)
  .put(upload.single("image"), controller.updateImage)
  .delete(controller.removeImage);
router
  .route("/:dog_id")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete)
  .all(methodNotAllowed);
router.route("/").post(controller.create).all(methodNotAllowed);

module.exports = {};

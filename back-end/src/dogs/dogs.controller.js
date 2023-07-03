const service = require("./dogs.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const path = require("path");
const fs = require("fs");

const VALID_PROPERTIES = [
  "name",
  "primary_breed",
  "mixed",
  "secondary_breed",
  "age",
  "size",
  "temperament",
  "likes",
  "dislikes",
  "owner",
];

const REQUIRED_PROPERTIES = [
  "name",
  "primary_breed",
  "age",
  "size",
  "temperament",
  "owner",
];

const VALID_AGES = ["Puppy", "Junior", "Adult", "Mature", "Senior"];
const VALID_SIZES = ["Teacup", "Toy", "Small", "Medium", "Large", "Giant"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  res.locals.dogData = data;
  const fields = Object.keys(data);
  const invalidFields = [];

  for (let i = 0; i < fields.length; i++) {
    if (!VALID_PROPERTIES.includes(fields[i])) {
      invalidFields.push(fields[i]);
    }
  }

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid user field(s): ${invalidFields.join(", ")}`,
    });
  }

  next();
}

function hasRequiredProperties(req, res, next) {
  const fields = Object.keys(res.locals.dogData);
  const missingFields = [];

  for (let i = 0; i < REQUIRED_PROPERTIES.length; i++) {
    if (!fields.includes(REQUIRED_PROPERTIES[i])) {
      missingFields.push(REQUIRED_PROPERTIES[i]);
    }
  }

  if (missingFields.length) {
    return next({
      status: 400,
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  next();
}

function hasValidAge(req, res, next) {
  const { age } = res.locals.dogData;

  if (!VALID_AGES.includes(age)) {
    return next({ status: 400, message: `${age} is not a valid age group.` });
  }

  next();
}

function hasValidSize(req, res, next) {
  const { size } = res.locals.dogData;

  if (!VALID_SIZES.includes(size)) {
    return next({ status: 400, message: `${size} is not a valid size group.` });
  }

  next();
}

function checkLoggedIn(req, res, next) {
  if (!req.session.loggedIn) {
    return next({ status: 400, message: "Not logged in." });
  }
  next();
}

async function create(req, res) {
  const newDog = await service.create(res.locals.dogData);
  res.status(201).json({ data: newDog[0] });
}

async function dogIdExists(req, res, next) {
  const dog_id = req.params.dog_id;
  const dog = await service.read(dog_id);

  if (dog) {
    res.locals.dog = dog;
    return next();
  }

  next({ status: 400, message: `Dog ID '${dog_id} cannot be found.` });
}

function checkSessionMatch(req, res, next) {
  if (!req.session.loggedIn) {
    return next({ status: 400, message: "Not logged in." });
  } else if (req.session.user.user_id !== res.locals.dog.owner) {
    return next({
      status: 400,
      message: "Invalid attempt to access dog profile.",
    });
  }

  next();
}

function read(req, res, next) {
  res.json({ data: res.locals.dog });
}

async function update(req, res) {
  const updatedDog = { ...res.locals.dogData, dog_id: res.locals.dog.dog_id };
  const data = await service.update(updatedDog);
  res.json({ data: data[0] });
}

async function destroy(req, res) {
  await service.destroy(res.locals.dog);
  res.sendStatus(204);
}

function fileIsImage(req, res, next) {
  if (req.file) {
    return next();
  }

  next({
    status: 400,
    message: "Invalid file type. Only image files are allowed.",
  });
}

function noCurrentImage(req, res, next) {
  const { dog_image } = res.locals.dog;

  if (dog_image) {
    return next({
      status: 400,
      message:
        "Profile image already exists. Use PUT method to update as needed.",
    });
  }

  next();
}

async function addImage(req, res) {
  const image = await service.addImage(req.file);
  const dogWithImage = await service.linkImage(
    res.locals.dog.dog_id,
    image.image_id
  );
  res.status(201).json({ data: dogWithImage });
}

async function imageIdExists(req, res, next) {
  const { dog_image } = res.locals.dog;
  const image = await service.readImage(dog_image);

  if (image) {
    res.locals.image = image;
    return next();
  }

  next({ status: 404, message: `Image ID '${image_id} cannot be found.` });
}

function getImage(req, res) {
  const { filename } = res.locals.image;
  const dotIndex = filename.indexOf(".");
  const fileType = filename.substring(dotIndex + 1);

  res.setHeader("Content-Type", `image/${fileType}`);
  res.sendFile(path.join(__dirname, res.locals.image.path));
}

async function removeImage(req, res) {
  const { dog_id } = res.locals.dog;
  const { image_id } = res.locals.image;
  await service.removeImage(dog_id, image_id);

  const imagePath = path.join(__dirname, res.locals.image.path);
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        res.status(500).send("Failed to delete image from server");
      } else {
        res.sendStatus(204);
      }
    });
  } else {
    res.status(404).send("Image not found.");
  }
}

async function updateImage(req, res) {
  const { image_id } = res.locals.image;

  const data = await service.updateImage(image_id, req.file);
  data = data[0];

  const imagePath = path.join(__dirname, res.locals.image.path);
  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        res.status(500).send("Failed to delete image from server");
      } else {
        res.status(201).json({ data });
      }
    });
  } else {
    res.status(404).send("Image not found.");
  }
}

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidAge,
    hasValidSize,
    checkLoggedIn,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(dogIdExists), checkLoggedIn, read],
  update: [
    asyncErrorBoundary(dogIdExists),
    checkSessionMatch,
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidAge,
    hasValidSize,
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(dogIdExists),
    checkSessionMatch,
    asyncErrorBoundary(destroy),
  ],
  getImage: [
    asyncErrorBoundary(dogIdExists),
    checkLoggedIn,
    asyncErrorBoundary(imageIdExists),
    getImage,
  ],
  addImage: [
    asyncErrorBoundary(dogIdExists),
    checkSessionMatch,
    fileIsImage,
    noCurrentImage,
    asyncErrorBoundary(addImage),
  ],
  updateImage: [
    asyncErrorBoundary(dogIdExists),
    checkSessionMatch,
    asyncErrorBoundary(imageIdExists),
    fileIsImage,
    asyncErrorBoundary(updateImage),
  ],
  removeImage: [
    asyncErrorBoundary(dogIdExists),
    checkSessionMatch,
    asyncErrorBoundary(imageIdExists),
    asyncErrorBoundary(removeImage),
  ],
};

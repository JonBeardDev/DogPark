const service = require("./users.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const VALID_PROPERTIES = [
  "username",
  "password",
  "first_name",
  "last_name",
  "email",
  "checked_in",
];

const REQUIRED_PROPERTIES = [
  "username",
  "password",
  "first_name",
  "last_name",
  "email",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  res.locals.userData = data;
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
  const fields = Object.keys(res.locals.userData);
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

async function validUserName(req, res, next) {
  const { username } = res.locals.userData;

  if (username.length < 3) {
    return next({
      status: 400,
      message: `Username '${username}' is too short. Username must be at least 3 characters.`,
    });
  }

  let existingUser;
  if (!req.session.loggedIn) {
    existingUser = await service.readUsername(username);
  } else {
    existingUser = await service.readUsernameForUpdate(
      username,
      req.session.user.user_id
    );
  }
  if (existingUser) {
    return next({
      status: 400,
      message: `Username '${username}' is already in use. Please choose a different username.`,
    });
  }

  next();
}

async function validEmail(req, res, next) {
  const { email } = res.locals.userData;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return next({ status: 400, message: `Invalid email format: '${email}'.` });
  }

  let existingUser;
  if (!req.session.loggedIn) {
    existingUser = await service.readEmail(email);
  } else {
    existingUser = await service.readEmailForUpdate(
      email,
      req.session.user.user_id
    );
  }
  if (existingUser) {
    return next({
      status: 400,
      message: `An account already exists for ${email}.`,
    });
  }

  next();
}

async function hashPassword(req, res, next) {
  const { password } = res.locals.userData;
  const hashedPassword = await bcrypt.hash(password, 13);

  res.locals.userData.password = hashedPassword;
  next();
}

async function create(req, res) {
  const newUser = await service.create(res.locals.userData);
  res.status(201).json({ data: newUser[0] });
}

const REQUIRED_LOGIN_PROPERTIES = ["username", "password"];

function hasOnlyValidLoginProperties(req, res, next) {
  const { data = {} } = req.body;
  res.locals.loginData = data;
  const fields = Object.keys(data);
  const invalidFields = [];

  for (let i = 0; i < fields.length; i++) {
    if (!REQUIRED_LOGIN_PROPERTIES.includes(fields[i])) {
      invalidFields.push(fields[i]);
    }
  }

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid login field(s): ${invalidFields.join(", ")}`,
    });
  }

  next();
}

function hasRequiredLoginProperties(req, res, next) {
  const fields = Object.keys(res.locals.loginData);
  const missingFields = [];

  for (let i = 0; i < REQUIRED_LOGIN_PROPERTIES.length; i++) {
    if (!fields.includes(REQUIRED_LOGIN_PROPERTIES[i])) {
      missingFields.push(REQUIRED_LOGIN_PROPERTIES[i]);
    }
  }

  if (missingFields.length) {
    return next({
      status: 400,
      message: `Missing required login field(s): ${missingFields.join(", ")}`,
    });
  }

  next();
}

async function usernameExists(req, res, next) {
  const { username } = res.locals.loginData;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let user;

  if (!emailPattern.test(username)) {
    user = await service.readUsername(username);
  } else {
    user = await service.readEmail(username);
  }

  if (user) {
    res.locals.user = user;
    return next();
  }

  next({
    status: 404,
    message: `Username/email '${username}' cannot be found.`,
  });
}

async function passwordCheck(req, res, next) {
  let plainTextPassword;
  if (res.locals.loginData) {
    plainTextPassword = res.locals.loginData.password;
  } else {
    plainTextPassword = res.locals.userData.old_password;
  }
  const storedPassword = res.locals.user.password;

  const isMatch = await bcrypt.compare(plainTextPassword, storedPassword);

  if (isMatch) return next();

  next({ status: 400, message: `Incorrect password.` });
}

function login(req, res) {
  delete res.locals.user.password;
  req.session.loggedIn = true;
  req.session.user = res.locals.user;
  res.json({ data: req.session });
}

async function userIdExists(req, res, next) {
  const user_id = req.params.user_id;
  const user = await service.readID(user_id);

  if (user) {
    res.locals.user = user;
    return next();
  }

  next({ status: 400, message: `User ID '${user_id} cannot be found.` });
}

function checkSessionMatch(req, res, next) {
  if (!req.session.loggedIn) {
    return next({ status: 400, message: "Not logged in." });
  } else if (req.session.user.user_id !== res.locals.user.user_id) {
    return next({ status: 400, message: "Invalid attempt to access user." });
  }

  next();
}

function logout(req, res) {
  req.session.destroy();
  res.sendStatus(204);
}

function checkLoggedIn(req, res, next) {
  if (!req.session.loggedIn) {
    return next({ status: 400, message: "Not logged in." });
  }
  next();
}

function read(req, res) {
  delete res.locals.user.password;
  res.json({ data: res.locals.user });
}

const VALID_UPDATE_PROPERTIES = [
  "username",
  "first_name",
  "last_name",
  "email",
  "checked_in",
];

const REQUIRED_UPDATE_PROPERTIES = [
  "username",
  "first_name",
  "last_name",
  "email",
];

function hasOnlyValidUpdateProperties(req, res, next) {
  const { data = {} } = req.body;
  res.locals.userData = data;
  const fields = Object.keys(data);
  const invalidFields = [];

  for (let i = 0; i < fields.length; i++) {
    if (!VALID_UPDATE_PROPERTIES.includes(fields[i])) {
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

function hasRequiredUpdateProperties(req, res, next) {
  const fields = Object.keys(res.locals.userData);
  const missingFields = [];

  for (let i = 0; i < REQUIRED_UPDATE_PROPERTIES.length; i++) {
    if (!fields.includes(REQUIRED_UPDATE_PROPERTIES[i])) {
      missingFields.push(REQUIRED_UPDATE_PROPERTIES[i]);
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

async function update(req, res) {
  const updatedUser = {
    ...res.locals.userData,
    user_id: res.locals.user.user_id,
    password: res.locals.user.password,
  };
  let data = await service.update(updatedUser);
  data = data[0];
  delete data.password;
  res.json({ data });
}

async function destroy(req, res) {
  await service.destroy(res.locals.user.user_id);
  req.session.destroy();
  res.sendStatus(204);
}

const VALID_PASSWORD_PROPERTIES = ["old_password", "password"];

function hasOnlyValidPasswordProperties(req, res, next) {
  const { data = {} } = req.body;
  res.locals.userData = data;
  const fields = Object.keys(data);
  const invalidFields = [];

  for (let i = 0; i < fields.length; i++) {
    if (!VALID_PASSWORD_PROPERTIES.includes(fields[i])) {
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

function hasRequiredPasswordProperties(req, res, next) {
  const fields = Object.keys(res.locals.userData);
  const missingFields = [];

  for (let i = 0; i < VALID_PASSWORD_PROPERTIES.length; i++) {
    if (!fields.includes(VALID_PASSWORD_PROPERTIES[i])) {
      missingFields.push(VALID_PASSWORD_PROPERTIES[i]);
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

async function updatePassword(req, res) {
  delete res.locals.userData.old_password;
  const updatedUser = {
    ...res.locals.userData,
    user_id: res.locals.user.user_id,
  };
  let data = await service.update(updatedUser);
  data = data[0];
  delete data.password;
  res.json({ data });
}

async function listFriends(req, res) {
  const friends = await service.listFriends(res.locals.user.user_id);
  res.json({ data: friends });
}

async function friendIdExists(req, res, next) {
  const friend_id = req.params.friend_id;
  const friend = await service.readID(friend_id);

  if (friend) {
    res.locals.friend_id = friend_id;
    return next();
  }

  next({ status: 400, message: `User ID '${user_id} cannot be found.` });
}

async function notCurrentFriend(req, res, next) {
  const friendStatus = await service.checkFriend(
    res.locals.user.user_id,
    res.locals.friend_id
  );

  if (friendStatus) {
    return next({
      status: 400,
      message: "User is already on your friend list",
    });
  }

  next();
}

async function addFriend(req, res) {
  const newFriendship = await service.addFriend(
    res.locals.user.user_id,
    res.locals.friend_id
  );
  res.status(201).json({ data: newFriendship[0] });
}

async function currentFriend(req, res, next) {
  const friendStatus = await service.checkFriend(
    res.locals.user.user_id,
    res.locals.friend_id
  );

  if (!friendStatus) {
    return next({
      status: 400,
      message: "User is not on your friend list",
    });
  }

  next();
}

async function removeFriend(req, res) {
  await service.removeFriend(res.locals.user.user_id, res.locals.friend_id);
  res.sendStatus(204);
}

async function search(req, res, next) {
  const { username } = req.query;

  if (username) {
    res.json({ data: await service.listByUsername(username) });
  } else {
    next({
      status: 400,
      message: "Must include at least partial username in search.",
    });
  }
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
  const { profile_image } = res.locals.user;

  if (profile_image) {
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
  const userWithImage = await service.linkImage(
    res.locals.user.user_id,
    image.image_id
  );
  res.status(201).json({ data: userWithImage });
}

async function imageIdExists(req, res, next) {
  const { profile_image } = res.locals.user;
  const image = await service.readImage(profile_image);

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
  const { user_id } = res.locals.user;
  const { image_id } = res.locals.image;
  await service.removeImage(user_id, image_id);

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
    asyncErrorBoundary(validUserName),
    asyncErrorBoundary(validEmail),
    asyncErrorBoundary(hashPassword),
    asyncErrorBoundary(create),
  ],
  login: [
    hasOnlyValidLoginProperties,
    hasRequiredLoginProperties,
    asyncErrorBoundary(usernameExists),
    asyncErrorBoundary(passwordCheck),
    login,
  ],
  logout: [asyncErrorBoundary(userIdExists), checkSessionMatch, logout],
  read: [asyncErrorBoundary(userIdExists), checkLoggedIn, read],
  update: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    hasOnlyValidUpdateProperties,
    hasRequiredUpdateProperties,
    asyncErrorBoundary(validUserName),
    asyncErrorBoundary(validEmail),
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    asyncErrorBoundary(destroy),
  ],
  updatePassword: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    hasOnlyValidPasswordProperties,
    hasRequiredPasswordProperties,
    asyncErrorBoundary(passwordCheck),
    asyncErrorBoundary(hashPassword),
    asyncErrorBoundary(updatePassword),
  ],
  listFriends: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    asyncErrorBoundary(listFriends),
  ],
  addFriend: [
    asyncErrorBoundary(userIdExists),
    asyncErrorBoundary(friendIdExists),
    checkSessionMatch,
    asyncErrorBoundary(notCurrentFriend),
    asyncErrorBoundary(addFriend),
  ],
  removeFriend: [
    asyncErrorBoundary(userIdExists),
    asyncErrorBoundary(friendIdExists),
    checkSessionMatch,
    asyncErrorBoundary(currentFriend),
    asyncErrorBoundary(removeFriend),
  ],
  search: [checkLoggedIn, asyncErrorBoundary(search)],
  getImage: [
    asyncErrorBoundary(userIdExists),
    checkLoggedIn,
    asyncErrorBoundary(imageIdExists),
    getImage,
  ],
  addImage: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    fileIsImage,
    noCurrentImage,
    asyncErrorBoundary(addImage),
  ],
  updateImage: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    asyncErrorBoundary(imageIdExists),
    fileIsImage,
    asyncErrorBoundary(updateImage),
  ],
  removeImage: [
    asyncErrorBoundary(userIdExists),
    checkSessionMatch,
    asyncErrorBoundary(imageIdExists),
    asyncErrorBoundary(removeImage),
  ],
};

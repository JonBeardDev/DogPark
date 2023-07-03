const knex = require("../db/connection");

function readUsername(username) {
  return knex("users").select("*").where({ username: username }).first();
}

function readUsernameForUpdate(username, user_id) {
  return knex("users")
    .select("*")
    .where({ username: username })
    .andWhereNot({ user_id: user_id })
    .first();
}

function readEmail(email) {
  return knex("users").select("*").where({ email: email }).first();
}

function readEmailForUpdate(email, user_id) {
  return knex("users")
    .select("*")
    .where({ email: email })
    .andWhereNot({ user_id: user_id })
    .first();
}

function create(user) {
  return knex("users").insert(user).returning("*");
}

function readID(user_id) {
  return knex("users").select("*").where({ user_id: user_id }).first();
}

function update(user) {
  return knex("users")
    .select("*")
    .where({ user_id: user.user_id })
    .update(user, "*");
}

function destroy(user_id) {
  return knex("users").where({ user_id: user_id }).del();
}

function listFriends(user_id) {
  return knex("friends")
    .join("users", "friends.friend_id", "users.user_id")
    .select(
      "users.user_id",
      "users.username",
      "users.first_name",
      "users.last_name",
      "users.checkedIn"
    )
    .where({ "friends.user_id": user_id });
}

function checkFriend(user_id, friend_id) {
  return knex("friends")
    .select("*")
    .where({ user_id: user_id })
    .andWhere({ friend_id: friend_id })
    .first();
}

function addFriend(user_id, friend_id) {
  const friendship = { user_id, friend_id };
  return knex("friends").insert(friendship).returning("*");
}

function removeFriend(user_id, friend_id) {
  return knex("friends")
    .where({ user_id: user_id })
    .andWhere({ friend_id: friend_id })
    .del();
}

function listByUsername(username) {
  return knex("users").whereILike("username", `%${username}%`);
}

function addImage(image) {
  return knex("images").insert(image).returning("*");
}

function linkImage(user_id, image_id) {
  return knex("users")
    .select("*")
    .where({ user_id: user_id })
    .update({ profile_image: image_id }, "*");
}

function readImage(image_id) {
  return knex("images").select("*").where({ image_id: image_id }).first();
}

function removeImage(user_id, image_id) {
  knex("users")
    .select("*")
    .where({ user_id: user_id })
    .update({ profile_image: null }, "*");

  return knex("images").where({ image_id: image_id }).del();
}

function updateImage(image_id, image) {
  return knex("images")
    .select("*")
    .where({ image_id: image_id })
    .update(image, "*");
}

module.exports = {
  readUsername,
  readUsernameForUpdate,
  readEmail,
  readEmailForUpdate,
  create,
  readID,
  update,
  destroy,
  listFriends,
  checkFriend,
  addFriend,
  removeFriend,
  listByUsername,
  addImage,
  linkImage,
  readImage,
  removeImage,
  updateImage,
};

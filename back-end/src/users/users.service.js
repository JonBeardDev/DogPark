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

module.exports = {
  readUsername,
  readUsernameForUpdate,
  readEmail,
  readEmailForUpdate,
  create,
  readID,
  update,
  destroy,
};

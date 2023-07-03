const knex = require("../db/connection");

function create(dog) {
  return knex("dogs").insert(dog).returning("*");
}

function read(dog_id) {
  return knex("dogs").select("*").where({ dog_id: dog_id }).first();
}

function update(dog) {
  return knex("dogs")
    .select("*")
    .where({ dog_id: dog.dog_id })
    .update(dog, "*");
}

function destroy(dog_id) {
  return knex("dogs").where({ dog_id: dog_id }).del();
}

function addImage(image) {
  return knex("images").insert(image).returning("*");
}

function linkImage(dog_id, image_id) {
  return knex("dogs")
    .select("*")
    .where({ dog_id: dog_id })
    .update({ dog_image: image_id }, "*");
}

function readImage(image_id) {
  return knex("images").select("*").where({ image_id: image_id }).first();
}

function removeImage(dog_id, image_id) {
  knex("dogs")
    .select("*")
    .where({ dog_id: dog_id })
    .update({ dog_image: null }, "*");

  return knex("images").where({ image_id: image_id }).del();
}

function updateImage(image_id, image) {
  return knex("images")
    .select("*")
    .where({ image_id: image_id })
    .update(image, "*");
}

module.exports = {
  create,
  read,
  update,
  destroy,
  addImage,
  linkImage,
  readImage,
  removeImage,
  updateImage,
};

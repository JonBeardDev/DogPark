/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("dogs", (table) => {
    table.integer("checked_in").unsigned().defaultTo(null);
    table
      .foreign("checked_in")
      .references("park_id")
      .inTable("parks")
      .onDelete("CASCADE");
    table.integer("dog_image").unsigned().defaultTo(null);
    table
      .foreign("dog_image")
      .references("image_id")
      .inTable("images")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("dogs", (table) => {
    table.dropColumn("checked_in");
    table.dropColumn("dog_image");
  });
};

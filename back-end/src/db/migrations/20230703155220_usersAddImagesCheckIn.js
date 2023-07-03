/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.integer("checked_in").unsigned().defaultTo(null);
    table
      .foreign("checked_in")
      .references("park_id")
      .inTable("parks")
      .onDelete("SET NULL");
    table.integer("profile_image").unsigned().defaultTo(null);
    table
      .foreign("profile_image")
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
  return knex.schema.table("users", (table) => {
    table.dropColumn("checked_in");
    table.dropColumn("profile_image");
  });
};

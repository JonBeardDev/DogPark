/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("parks", (table) => {
    table.integer("park_image").unsigned().defaultTo(null);
    table
      .foreign("park_image")
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
  return knex.schema.table("parks", (table) => {
    table.dropColumn("park_image");
  });
};

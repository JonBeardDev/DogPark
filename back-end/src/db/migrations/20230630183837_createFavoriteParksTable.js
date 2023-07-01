/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("favorite_parks", (table) => {
    table.integer("user").notNullable();
    table
      .foreign("user")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("park").unsigned().notNullable();
    table
      .foreign("park")
      .references("park_id")
      .inTable("parks")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("favorite_parks");
};

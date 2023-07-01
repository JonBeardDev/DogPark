/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("friends", (table) => {
    table.integer("user").notNullable();
    table
      .foreign("user")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("friend").notNullable();
    table
      .foreign("friend")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("friends");
};

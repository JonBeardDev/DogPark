/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("dogs", (table) => {
    table.increments("dog_id").primary();
    table.string("name").notNullable();
    table.string("primary_breed").notNullable();
    table.boolean("mixed").notNullable();
    table.string("secondary_breed").defaultTo(null);
    table.string("age").notNullable();
    table.string("size").notNullable();
    table.string("temperament").notNullable();
    table.string("likes").defaultTo(null);
    table.string("dislikes").defaultTo(null);
    table.integer("owner").notNullable();
    table
      .foreign("owner")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("checked_in").unsigned().defaultTo(null);
    table
      .foreign("checked_in")
      .references("park_id")
      .inTable("parks")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("dogs");
};

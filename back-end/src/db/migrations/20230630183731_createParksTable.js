/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("parks", (table) => {
    table.increments("park_id").primary();
    table.string("name").notNullable();
    table.string("street_address").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("zip").notNullable();
    table.boolean("small_dogs").notNullable();
    table.boolean("medium_dogs").notNullable();
    table.time("monday_open").defaultTo(null);
    table.time("monday_close").defaultTo(null);
    table.time("tuesday_open").defaultTo(null);
    table.time("tuesday_close").defaultTo(null);
    table.time("wednesday_open").defaultTo(null);
    table.time("wednesday_close").defaultTo(null);
    table.time("thursday_open").defaultTo(null);
    table.time("thursday_close").defaultTo(null);
    table.time("friday_open").defaultTo(null);
    table.time("friday_close").defaultTo(null);
    table.time("saturday_open").defaultTo(null);
    table.time("saturday_close").defaultTo(null);
    table.time("sunday_open").defaultTo(null);
    table.time("sunday_close").defaultTo(null);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("parks");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("check_ins", (table) => {
    table.date("check_in_date").notNullable();
    table.time("check_in_time").notNullable();
    table.time("check_out_time").notNullable();
    table.integer("user").notNullable();
    table
      .foreign("user")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("dog").unsigned().notNullable();
    table
      .foreign("dog")
      .references("dog_id")
      .inTable("dogs")
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
  return knex.schema.dropTable("check_ins");
};

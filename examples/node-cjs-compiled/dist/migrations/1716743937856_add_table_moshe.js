"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema.createTable('moshe').addColumn('id', 'integer').execute();
}
async function down(db) {
    await db.schema.dropTable('moshe').execute();
}

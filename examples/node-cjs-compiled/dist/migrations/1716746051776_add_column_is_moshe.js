"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute();
}
async function down(db) {
    await db.schema.alterTable('moshe').dropColumn('is_moshe').execute();
}

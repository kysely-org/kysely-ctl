"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const kysely_1 = require("kysely");
const kysely_ctl_1 = require("kysely-ctl");
exports.default = (0, kysely_ctl_1.defineConfig)({
    destroyOnExit: true,
    kysely: () => new kysely_1.Kysely({
        dialect: new kysely_1.SqliteDialect({
            database: (0, better_sqlite3_1.default)((0, node_path_1.resolve)(__dirname, 'example.db')),
        }),
    }),
    migrations: {
        allowJS: true,
    },
});

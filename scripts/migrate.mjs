import { readFile } from 'node:fs/promises';
import { sql } from '../lib/db.mjs';

const schema = await readFile('db/schema.sql', 'utf8');

const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map(statement => statement.replace(/--[^\r\n]*/g, '').trim())
  .filter(Boolean);

for (const statement of statements) await sql.query(statement);

console.log(`Applied ${statements.length} schema statements.`);

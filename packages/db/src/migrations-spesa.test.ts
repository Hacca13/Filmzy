import { readFileSync } from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

import { MIGRATIONS_DIR } from './open.js';

function statements(file: string): string[] {
  return readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '');
}

describe('migrazione 0003: la spesa per fornitore e per film', () => {
  it('gli scontrini scritti prima ritrovano fornitore e film dal loro JSON', () => {
    const db = new Database(':memory:');
    for (const statement of statements('0002_scontrini.sql')) db.exec(statement);

    const old = {
      id: 'vecchio',
      connectionId: 'fal',
      projectId: 'film-1',
    };
    const insert = db.prepare(
      "INSERT INTO generations (id, purpose, role, model_id, status, estimated_cost_usd, created_at, receipt) VALUES (?, 'product', 'camera_operator', 'm', 'succeeded', 1, 0, ?)",
    );
    insert.run('vecchio', JSON.stringify(old));
    insert.run('senza-film', JSON.stringify({ id: 'senza-film', connectionId: 'anthropic' }));
    insert.run('rotto', 'non è json?');

    // Lo scontrino «rotto» non è JSON: la migrazione non deve farsi fermare da una riga così.
    db.exec("UPDATE generations SET receipt = '{}' WHERE id = 'rotto'");
    for (const statement of statements('0003_spesa-per-fornitore-e-film.sql')) db.exec(statement);

    const rows = db
      .prepare(
        'SELECT id, connection_id AS connectionId, project_id AS projectId FROM generations ORDER BY id',
      )
      .all();
    expect(rows).toEqual([
      { id: 'rotto', connectionId: '', projectId: null },
      { id: 'senza-film', connectionId: 'anthropic', projectId: null },
      { id: 'vecchio', connectionId: 'fal', projectId: 'film-1' },
    ]);
    db.close();
  });
});

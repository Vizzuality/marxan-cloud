"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddApiEventsTable1615293097000 = void 0;
class AddApiEventsTable1615293097000 {
    async up(queryRunner) {
        await queryRunner.query(`
CREATE TABLE api_event_kinds (
  id varchar primary key
);

INSERT INTO api_event_kinds (id) values
('user.signedUp/v1alpha1'),
('user.accountActivationTokenGenerated/v1alpha1'),
('user.accountActivationSucceeded/v1alpha1'),
('user.accountActivationFailed/v1alpha1'),
('user.passwordResetTokenGenerated/v1alpha1'),
('user.passwordResetSucceeded/v1alpha1'),
('user.passwordResetFailed/v1alpha1');
    `);
        await queryRunner.query(`
CREATE TABLE api_events (
  id uuid primary key not null default uuid_generate_v4(),
  timestamp timestamp not null default now(),
  kind varchar not null references api_event_kinds(id),
  topic uuid not null,
  data jsonb
);

CREATE INDEX IF NOT EXISTS api_events_kind_api_version__idx ON api_events(kind);
CREATE INDEX IF NOT EXISTS api_events_topic__idx ON api_events(topic);
CREATE INDEX IF NOT EXISTS api_events_latest_events_for_topic__idx ON api_events(topic, timestamp desc);
    `);
        await queryRunner.query(`
CREATE VIEW latest_api_event_by_topic_and_kind AS
  SELECT DISTINCT ON (topic, kind)
  topic, timestamp, kind, data
  FROM api_events
  ORDER BY topic, kind, timestamp DESC;

CREATE VIEW first_api_event_by_topic_and_kind AS
  SELECT DISTINCT ON (topic, kind)
  topic, timestamp, kind, data
  FROM api_events
  ORDER BY topic, kind, timestamp ASC;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
DROP VIEW first_api_event_by_topic_and_kind;
DROP VIEW latest_api_event_by_topic_and_kind;

DROP TABLE api_events;

DROP TABLE api_event_kinds;
    `);
    }
}
exports.AddApiEventsTable1615293097000 = AddApiEventsTable1615293097000;
//# sourceMappingURL=1615293097000-AddApiEventsTable.js.map
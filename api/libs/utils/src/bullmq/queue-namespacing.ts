/**
 * This is a basic way to provide some kind of namespacing to queue names, so
 * that distinct MarxanCloud instances running with different `NODE_ENV`
 * settings may share a single Redis db.
 *
 * @debt If ever running more than one MarxanCloud instance with identical
 * `NODE_ENV` using the same Redis db, this will need to be refactored to
 * provide namespacing through different means than `NODE_ENV`.
 */
export const bullmqPrefix = () => {
  return process.env.NODE_ENV ? `bull-${process.env.NODE_ENV}` : 'bull';
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropCountriesTable1614257418000 = void 0;
class DropCountriesTable1614257418000 {
    async up(queryRunner) {
        await queryRunner.query(`
DROP TABLE countries;
`);
    }
    async down(queryRunner) {
        await queryRunner.query(`
CREATE TABLE countries (
  iso_3166_1_alpha2 varchar(2) not null primary key,
  iso_3166_1_alpha3 varchar(3) not null,
  name varchar not null,
  local_names jsonb
);
`);
    }
}
exports.DropCountriesTable1614257418000 = DropCountriesTable1614257418000;
//# sourceMappingURL=1614257418000-DropCountriesTable.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyListForFeatures1619777176256 = void 0;
class PropertyListForFeatures1619777176256 {
    async up(queryRunner) {
        await queryRunner.query(`
    ALTER TABLE features
    ADD COLUMN list_property_keys jsonb;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
     ALTER TABLE features
     DROP COLUMN list_property_keys;
     `);
    }
}
exports.PropertyListForFeatures1619777176256 = PropertyListForFeatures1619777176256;
//# sourceMappingURL=1619777176256-PropertyListForFeatures.js.map
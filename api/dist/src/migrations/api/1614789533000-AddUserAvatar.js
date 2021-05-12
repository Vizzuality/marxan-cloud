"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserAvatar1614789533000 = void 0;
class AddUserAvatar1614789533000 {
    async up(queryRunner) {
        await queryRunner.query(`
ALTER TABLE users
  ADD COLUMN avatar_data_url text;
`);
    }
    async down(queryRunner) {
        await queryRunner.query(`
ALTER TABLE users
  DROP COLUMN avatar_data_url;
`);
    }
}
exports.AddUserAvatar1614789533000 = AddUserAvatar1614789533000;
//# sourceMappingURL=1614789533000-AddUserAvatar.js.map
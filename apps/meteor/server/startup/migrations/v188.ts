import { Permissions } from '@rocket.chat/models';

import { addMigration } from '../../lib/migrations';

const newRolePermissions = ['view-d-room', 'view-p-room'];

const roleId = 'guest';

addMigration({
	version: 188,
	up() {
		return Permissions.update({ _id: { $in: newRolePermissions } }, { $addToSet: { roles: roleId } }, { multi: true });
	},
});

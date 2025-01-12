import { LivechatInquiry } from '@rocket.chat/models';

import { addMigration } from '../../lib/migrations';

addMigration({
	version: 186,
	up() {
		LivechatInquiry.find({}, { fields: { _id: 1, ts: 1 } }).forEach((inquiry) => {
			const { _id, ts } = inquiry;

			LivechatInquiry.update(
				{ _id },
				{
					$set: {
						queueOrder: 1,
						estimatedWaitingTimeQueue: 0,
						estimatedServiceTimeAt: ts,
					},
				},
			);
		});
	},
});

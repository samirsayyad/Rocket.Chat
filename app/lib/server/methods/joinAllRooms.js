import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { hasPermission, canAccessRoom } from '../../../authorization';
import { Rooms } from '../../../models';
import { Tokenpass, updateUserTokenpassBalances } from '../../../tokenpass/server';
import { addUserToRoom } from '../functions';
import { roomTypes, RoomMemberActions } from '../../../utils/server';

Meteor.methods({
	joinAllRooms(rids, code) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'joinAllRooms' });
        }
        const user = Meteor.user();
        rids.forEach((room,index,array)=>{
            check(room._id, String);
            if (room && roomTypes.getConfig(room.t).allowMemberAction(room, RoomMemberActions.JOIN)) {
                // TODO we should have a 'beforeJoinRoom' call back so external services can do their own validations
                if (room.tokenpass && user && user.services && user.services.tokenpass) {
                    const balances = updateUserTokenpassBalances(user);

                    if (!Tokenpass.validateAccess(room.tokenpass, balances)) {
                        throw new Meteor.Error('error-not-allowed', 'Token required', { method: 'joinAllRooms' });
                    }
                } else {
                    if (!canAccessRoom(room, Meteor.user())) {
                        throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'joinAllRooms' });
                    }
                    if ((room.joinCodeRequired === true) && (code !== room.joinCode) && !hasPermission(Meteor.userId(), 'join-without-join-code')) {
                        throw new Meteor.Error('error-code-invalid', 'Invalid Room Password', { method: 'joinAllRooms' });
                    }
                }
                addUserToRoom(room._id, user);
                Meteor.runAsUser(Meteor.userId(), () => {
                    Meteor.call('openRoom', room._id);
                });
            }else{
                throw new Meteor.Error('error-not-allowed', 'allowMemberAction', { method: 'joinAllRooms' });

            }
        })
        return true;
	},
});

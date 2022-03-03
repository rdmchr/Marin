import sdk, { Models } from 'node-appwrite';
import { Query } from './Query';
import {AWLedgerUser, AWList} from "appwrite-data/types/node"

const listCollection = process.env.LIST_COLLECTION as string;
const usersCollection = process.env.USERS_COLLECTION as string;
const invitesCollection = process.env.INVITES_COLLECTION as string;
const apiKey = process.env.API_KEY as string;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
const userId = process.env.APPWRITE_FUNCTION_USER_ID as string;
const data = JSON.parse(process.env.APPWRITE_FUNCTION_DATA as string);

const appwrite = new sdk.Client();
appwrite.setEndpoint('https://api.gettooru.com/v1').setProject(projectId).setKey(apiKey);
const database = new sdk.Database(appwrite);

async function createInvite() {
    const { list, email } = data;

    if (!list) {
        throw new Error('Missing required parameter: list');
    }

    if (!email) {
        throw new Error('Missing required parameter: email');
    }

    // check user permission
    const listDoc = await database.getDocument<AWList>(listCollection, list).then((res) => {
        return res;
    }, (err) => {
        throw err;
    });
    if (!listDoc) {
        throw new Error('List not found');
    }
    if (!listDoc.$write.includes(`user:${userId}`)) {
        throw new Error('You do not have permission to invite members to this list');
    }

    // find user using email
    const user = await database.listDocuments<AWLedgerUser>(usersCollection, [Query.equal("email", email)]).then((res) => { return res.documents[0] }, (err) => { throw err });
    if (!user) {
        console.error('User not found');
        process.exit(2);
    }

    // get sender document
    const sender = await database.getDocument<AWUser>(usersCollection, userId).then((res) => { return res }, (err) => { throw err });

    // grant user read access to list
    await database.updateDocument(listCollection, list, { name: listDoc.name }, [...listDoc.$read, `user:${user.$id}`]);

    // grant addressee read access to sender document
    await database.updateDocument(usersCollection, userId, {email: sender.email}, [...sender.$read, `user:${user.$id}`]);

    // create invite
    await database.createDocument(invitesCollection, 'unique()', {
        sender: userId,
        addressee: user.$id,
        list: listDoc.$id
    }, [`user:${userId}`, `user:${user.$id}`], [`user:${userId}`]);
    console.log('Invite sent');
}

createInvite();

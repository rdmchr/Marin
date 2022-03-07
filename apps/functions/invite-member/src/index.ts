import sdk, { Models, Query } from 'node-appwrite';
import {AWLedgerUser, AWList} from "appwrite-data/types/node"
import { APPWRITE_COLLECTION_INVITES, APPWRITE_COLLECTION_LISTS, APPWRITE_COLLECTION_USERS, APPWRITE_ENDPOINT } from 'appwrite-data/constants';

const apiKey = process.env.API_KEY as string;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
const userId = process.env.APPWRITE_FUNCTION_USER_ID as string;
const data = JSON.parse(process.env.APPWRITE_FUNCTION_DATA as string);

const appwrite = new sdk.Client();
appwrite.setEndpoint(APPWRITE_ENDPOINT).setProject(projectId).setKey(apiKey);
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
    const listDoc = await database.getDocument<AWList>(APPWRITE_COLLECTION_LISTS, list).then((res) => {
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
    const user = await database.listDocuments<AWLedgerUser>(APPWRITE_COLLECTION_USERS, [Query.equal("email", email)]).then((res) => { return res.documents[0] }, (err) => { throw err });
    if (!user) {
        console.error('User not found');
        process.exit(2);
    }

    // get sender document
    const sender = await database.getDocument<AWLedgerUser>(APPWRITE_COLLECTION_USERS, userId).then((res) => { return res }, (err) => { throw err });

    // grant user read access to list
    await database.updateDocument(APPWRITE_COLLECTION_LISTS, list, { name: listDoc.name }, [...listDoc.$read, `user:${user.$id}`]);

    // grant addressee read access to sender document
    await database.updateDocument(APPWRITE_COLLECTION_USERS, userId, {email: sender.email}, [...sender.$read, `user:${user.$id}`]);

    // create invite
    await database.createDocument(APPWRITE_COLLECTION_INVITES, 'unique()', {
        sender: userId,
        addressee: user.$id,
        list: listDoc.$id
    }, [`user:${userId}`, `user:${user.$id}`], [`user:${userId}`]);
    console.log('Invite sent');
}

createInvite();

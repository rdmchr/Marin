import sdk from 'node-appwrite';
import { APPWRITE_COLLECTION_USERS, APPWRITE_ENDPOINT } from 'appwrite-data/constants'

const apiKey = process.env.API_KEY as string;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
const { $id, email, name } = JSON.parse(process.env.APPWRITE_FUNCTION_EVENT_DATA as string);
const event = process.env.APPWRITE_FUNCTION_EVENT as string;

const appwrite = new sdk.Client();
appwrite.setEndpoint(APPWRITE_ENDPOINT).setProject(projectId).setKey(apiKey);
const database = new sdk.Database(appwrite);

async function createUserInLedger() {
    switch (event) {
        case 'users.create':
        case 'account.create':
            console.log('Creating user in ledger');
            await database.createDocument(APPWRITE_COLLECTION_USERS, $id,
                {
                    email,
                    name,
                }, [], []);
            break;
        case 'users.update.email':
        case 'account.update.email':
            console.log('Updating user email in ledger');
            await database.updateDocument(APPWRITE_COLLECTION_USERS, $id, {
                email,
            }, [], []);
            break;
        case "account.update.name":
        case "users.update.name":
            console.log('Updating user name in ledger');
            await database.updateDocument(APPWRITE_COLLECTION_USERS, $id, {
                name,
            }, [], []);
            break;
        case 'users.delete':
        case 'account.delete':
            console.log('Deleting user from ledger');
            await database.deleteDocument(APPWRITE_COLLECTION_USERS, $id);
            break;
        default:
            console.error('Unknown event');
            console.error(event);
            process.exit(2);
    }

}

createUserInLedger();

import sdk from 'node-appwrite';
import { APPWRITE_COLLECTION_LISTS, APPWRITE_ENDPOINT } from 'appwrite-data/constants'

const apiKey = process.env.API_KEY as string;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
const userId = process.env.APPWRITE_FUNCTION_USER_ID as string;
const data = JSON.parse(process.env.APPWRITE_FUNCTION_DATA as string);

if (!data.name) {
    throw new Error('Missing required parameter: name');
}

const appwrite = new sdk.Client();
appwrite.setEndpoint(APPWRITE_ENDPOINT).setProject(projectId).setKey(apiKey);
const database = new sdk.Database(appwrite);

async function createList() {
    await database.createDocument(APPWRITE_COLLECTION_LISTS, 'unique()', {name: data.name}, [`user:${userId}`], [`user:${userId}`]);
}

createList();

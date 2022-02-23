import sdk from 'node-appwrite';

const listCollection = '62114ed22004848a2dcf';
const apiKey = process.env.API_KEY as string;
const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID as string;
const userId = process.env.APPWRITE_FUNCTION_USER_ID as string;
const data = JSON.parse(process.env.APPWRITE_FUNCTION_DATA as string);

if (!data.name) {
    throw new Error('Missing required parameter: name');
}

const appwrite = new sdk.Client();
appwrite.setEndpoint('https://api.gettooru.com/v1').setProject(projectId).setKey(apiKey);
const database = new sdk.Database(appwrite);

async function createList() {
    await database.createDocument(listCollection, 'unique()', {name: data.name}, [userId], [userId]);
}

createList();

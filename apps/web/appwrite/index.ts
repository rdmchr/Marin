import { Appwrite } from "appwrite";
import {APPWRITE_ENDPOINT, APPWRITE_PROJECT} from "appwrite-data/constants";

// Init your Web SDK
const appwrite = new Appwrite();

appwrite
    .setEndpoint(APPWRITE_ENDPOINT) // Your Appwrite Endpoint
    .setProject(APPWRITE_PROJECT) // Your project ID
    ;

export { appwrite };
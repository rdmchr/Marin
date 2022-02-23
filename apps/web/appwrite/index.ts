import { Appwrite } from "appwrite";

// Init your Web SDK
const appwrite = new Appwrite();

appwrite
    .setEndpoint('https://api.gettooru.com/v1') // Your Appwrite Endpoint
    .setProject('62114ec09114aca3c72c') // Your project ID
    ;

export { appwrite };
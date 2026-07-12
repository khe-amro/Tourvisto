import {Account, Client, Databases, Storage} from "appwrite";
export const appwriteconfig = {
    endpointUrl:import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId:import.meta.env.VITE_APPWRITE_PROJECT_ID,
    apikey:import.meta.env.VITE_APPWRITE_API_KEY,
    databaseId:import.meta.env.VITE_APPWRITE_DATABASE_KEY,
    userCollectionId:import.meta.env.VITE_APPWRITE_USERS_COLLECTION,
    tripCollectionId:import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION
}

const client = new Client()
    .setEndpoint(appwriteconfig.endpointUrl)
    .setProject(appwriteconfig.projectId)

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export const createAppwriteClient = (cookie?: string) => {
    const runtimeClient = new Client()
        .setEndpoint(appwriteconfig.endpointUrl)
        .setProject(appwriteconfig.projectId);

    if (cookie) {
        runtimeClient.setCookie(cookie);
    }

    return runtimeClient;
};

export {account, database, storage, client};


// .server.ts — Vite/React Router will NEVER bundle this for the browser
import { Client, Databases, Query } from "node-appwrite";

const adminClient = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
    .setKey(process.env.VITE_APPWRITE_API_KEY!);

const adminDatabase = new Databases(adminClient);

const databaseId  = process.env.VITE_APPWRITE_DATABASE_KEY!;
const userCollectionId = process.env.VITE_APPWRITE_USERS_COLLECTION!;

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await adminDatabase.listDocuments(
            databaseId,
            userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        );

        return { users, total };
    } catch (e) {
        console.error("Error fetching users:", e);
        return { users: [], total: 0 };
    }
};


import type { StringQueryType } from "vite/types/importGlob.js"
import { appwriteconfig, database } from "../appwrite/client"
import { Query } from "appwrite"

export const getAllTrips = async (limit: number, offset: number) => {
    const allTrips = await database.listDocuments(
        appwriteconfig.databaseId,
        appwriteconfig.tripCollectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]

    )
    if (allTrips.total === 0) {
        console.log('No Trips Found')
        return { allTrips: [], total: 0 }
    }
    return {
        allTrips: allTrips.documents,
        total: allTrips.total,

    }
}

export const getTripById = async (tripId: StringQueryType) => {
    const trip = await database.getDocument(
        appwriteconfig.databaseId,
        appwriteconfig.tripCollectionId,
        tripId
    );
    if (!trip.$id) {
        console.log('TRIP Not Found')
        return null
    }
    return trip;
}
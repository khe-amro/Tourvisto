import { data, type ActionFunctionArgs } from 'react-router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseMarkdownToJson, parseTripData } from '../../../lib/utils';
import { appwriteconfig, database } from '~/appwrite/client';
import { ID } from 'node-appwrite';
// import {createProduct} from "../../../lib/stripe";

// --- retry helper -----------------------------------------------------
// Wraps a call in exponential backoff so a transient 429 from Gemini
// doesn't take down the whole request. Retries 3 times before giving up.
async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    baseDelayMs = 1000
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const status = err?.status ?? err?.response?.status;
            const isRateLimit = status === 429;
            const isServerError = status >= 500;

            // Only retry on rate limits / transient server errors
            if (!isRateLimit && !isServerError) throw err;
            if (attempt === retries) break;

            // Respect Google's suggested retryDelay if present, else backoff
            const suggested = err?.errorDetails?.find(
                (d: any) => d['@type']?.includes('RetryInfo')
            )?.retryDelay;
            const suggestedMs = suggested ? parseFloat(suggested) * 1000 : null;
            const delay = suggestedMs ?? baseDelayMs * 2 ** attempt;

            console.warn(
                `Gemini call failed (attempt ${attempt + 1}/${retries + 1}, status ${status}). Retrying in ${Math.round(delay)}ms...`
            );
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    throw lastError;
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId,
    } = await request.json();

    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

    // Use the auto-updated alias instead of pinning a specific version.
    // Google hot-swaps this to whatever the current stable Flash model is,
    // so you stop breaking every time a version gets deprecated/shut down.
    const MODEL_NAME = 'gemini-flash-latest';

    try {
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    
    Return the itinerary and lowest estimated price in a JSON format enclosed in a \`\`\`json markdown block, matching this exact structure:
    {
      "name": "A descriptive title for the trip",
      "description": "A brief description of the trip and its highlights not exceeding 100 words",
      "estimatedPrice": "Lowest average price for the trip in USD, e.g. $price",
      "duration": ${numberOfDays},
      "budget": "${budget}",
      "travelStyle": "${travelStyle}",
      "country": "${country}",
      "interests": "${interests}",
      "groupType": "${groupType}",
      "bestTimeToVisit": [
        "🌸 Season (from month to month): reason to visit",
        "☀️ Season (from month to month): reason to visit",
        "🍁 Season (from month to month): reason to visit",
        "❄️ Season (from month to month): reason to visit"
      ],
      "weatherInfo": [
        "☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
        "❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)"
      ],
      "location": {
        "city": "name of the city or region",
        "coordinates": [0, 0],
        "openStreetMap": "link to open street map"
      },
      "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit local sights"},
            {"time": "Afternoon", "description": "🖼️ Visit a museum"},
            {"time": "Evening", "description": "🍷 Dinner"}
          ]
        }
      ]
    }`;

        const textResult = await withRetry(() =>
            genAi.getGenerativeModel({ model: MODEL_NAME }).generateContent([prompt])
        );

        const trip = parseMarkdownToJson(textResult.response.text());

        if (!trip) {
            throw new Error('Could not parse generated trip itinerary JSON from model response');
        }

        const query = encodeURIComponent(`${country} ${interests} ${travelStyle}`);
        const imageResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashApiKey}`
        );
        const imageJson = await imageResponse.json();
        const imageUrls = Array.isArray(imageJson.results)
            ? imageJson.results.slice(0, 3).map((result: any) => result.urls?.regular || null)
            : [];

        const result = await database.createDocument(
            appwriteconfig.databaseId,
            appwriteconfig.tripCollectionId,
            ID.unique(),
            {
                tripDetail: JSON.stringify(trip),
                createdAt: new Date().toISOString(),
                imageUrls,
                userId,
            }
        );
        return data({ id: result.$id });
    } catch (e: any) {
        console.error('Error generating a travel plan:', e);

        // Surface a clearer message for the specific quota-bucket bug
        const isZeroQuota = e?.message?.includes('free_tier') && e?.message?.includes('limit: 0');
        const friendlyMessage = isZeroQuota
            ? 'Gemini API is not receiving quota — check that Cloud Billing is linked to your Google Cloud project (this is required even for free-tier usage).'
            : e?.message || 'Error generating travel plan';

        return data({ error: friendlyMessage }, { status: 500 });
    }
};
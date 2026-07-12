import { type RouteConfig, index, layout,route } from "@react-router/dev/routes";

export default [
    route("sign-in","routes/route/sign-in.tsx"),
    route('api/create-trip','routes/api/create-trip.ts'),
    layout("routes/admin/adminLayout.tsx", [
        route('dashboard',"routes/admin/dashboard.tsx"),
        route('allUsers',"routes/admin/allUsers.tsx"),
        route('trips',"routes/admin/trips.tsx"),
        route('trips/create',"routes/admin/create-trip.tsx"),
        route('trips/:tripId',"routes/admin/trip-detail.tsx"),

    ]),
    layout('routes/route/page-layout.tsx',[
        index('routes/route/travel-page.tsx'),
        route('/travel/:tripId', 'routes/route/travel-detail.tsx'),
        route('/travel/:tripId/success', 'routes/route/payment-success.tsx'),
    ])
] satisfies RouteConfig;
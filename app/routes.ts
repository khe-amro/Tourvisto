import { type RouteConfig, layout,route } from "@react-router/dev/routes";

export default [
    route("sign-in","routes/route/sign-in.tsx"),
    route('api/create-trip','routes/api/create-trip.ts'),
    layout("routes/admin/adminLayout.tsx", [
        route('dashboard',"routes/admin/dashboard.tsx"),
        route('allUsers',"routes/admin/allUsers.tsx"),
        route('trips',"routes/admin/trips.tsx"),
        route('trips/create',"routes/admin/create-trip.tsx"),

    ]),
] satisfies RouteConfig;
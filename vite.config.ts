import { sentryVitePlugin } from "@sentry/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { ViteDevServer, Connect } from "vite";
import type { ServerResponse } from "node:http";
import {  sentryReactRouter, type SentryReactRouterBuildOptions } from "@sentry/react-router";


const sentryConfig:SentryReactRouterBuildOptions ={
     org: "amrokhaled",
    project: "travel_agency_dashboard",
    authToken:"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"
};


export default defineConfig(config => {
  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      sentryReactRouter(sentryConfig, config),
      {
        name: 'ignore-well-known',
        configureServer(server: ViteDevServer) {
          server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
            if (req.url?.startsWith('/.well-known/')) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end('{"error":"Not found"}');
              return;
            }
            next();
          });
        },
      },
      sentryVitePlugin({
        org: "amrokhaled",
        project: "travel_agency_dashboard"
      })
    ],

    server: {
      port: 5173,
      strictPort: false,
    },

    resolve: {
      tsconfigPaths: true,
    },

    ssr: {
      noExternal: [/@syncfusion/],
      external: ['node-appwrite'],
    },

    optimizeDeps: {
      exclude: ['node-appwrite'],
    },

    build: {
      sourcemap: true
    }
  };
});

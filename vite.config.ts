import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    {
      name: 'ignore-well-known',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/.well-known/')) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end('{"error":"Not found"}');
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    tsconfigPaths: true,
  },
  ssr:{
    noExternal:[/@syncfusion/]
  }
});

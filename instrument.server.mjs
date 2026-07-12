import * as Sentry from "@sentry/react-router";
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: "https://08e57c25eec63bc3dbcbbe0b9dacdde2@o4511665839144960.ingest.de.sentry.io/4511689695494224",
 
 // Adds request headers and IP for users, for more info visit:
 // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
 sendDefaultPii: true,
 
 integrations: [nodeProfilingIntegration()],
 tracesSampleRate: 1.0, // Capture 100% of the transactions
 profilesSampleRate: 1.0, // profile every transaction
});
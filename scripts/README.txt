Static page build

Page renderers and content remain in assets/site.js. Public HTML is pre-rendered and uses assets/client.js for navigation, forms and analytics.

To update rendered content, edit assets/site.js, install Playwright in your build environment and run node scripts/prerender.cjs. Set CHROME_PATH to an installed Chromium browser if needed. The build uses loopback port 8875, blocks Google Analytics and regenerates public pages plus client.js. Commit generated HTML and client.js together. Do not run the build against production visitor traffic.

Credentials: the trust register deliberately contains no verified licence claims without issuer evidence. Confirm legal entity, number, issuer, scope and validity before publishing certificates. Never publish private PAN, Aadhaar, signatures, bank account details or authentication information.

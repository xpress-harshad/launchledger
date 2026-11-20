# LaunchLedger

LaunchLedger is a self-hosted website launch and handover workspace for freelancers, web agencies, and site owners. Track launch blockers, assign owners, and give clients a branded record of the work.

- Start with a new website, migration, or online store checklist.
- Track launch blockers separately from required handover checks.
- Record internal notes and client-facing handover notes on each check.
- Download a standalone HTML handover report containing check status and client-facing notes. The report opens in a browser and can be printed to PDF.
- Export a JSON project backup and import it on another device.

## Run locally

Use Node.js 22 or newer. No packages, API keys, or database are required.

```sh
npm start
```

Open http://localhost:3000. The sample project demonstrates the workflow. Choose **New project** to begin your own.

Projects are stored in the current browser profile and origin. A new device, browser profile, or domain starts with a fresh workspace. JSON backups include internal notes. Share HTML reports with clients and keep JSON backups with your project files. Store account passwords or other secrets in your password manager.

## Brand your copy

Change the application name and studio name in `settings.js`. Customize checklist templates in the same file. Template edits apply to newly created projects, and any renamed preset should remain available if you need to import backups using its previous name.

## Deploy on Hostinger

Use the Node.js Web App workflow and import the public GitHub repository. If asked, select **Other** for the framework, choose Node.js 22 or 24, and use `server.mjs` as the entry file. The app uses the port assigned by the host. No build output or extra services are needed. Check Hostinger’s [Node.js deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) for plan availability.

The four browser files (`index.html`, `style.css`, `app.js`, and `settings.js`) can also be published as a static site at the root of a domain or subdomain on other hosting providers.

## License

[MIT](LICENSE)

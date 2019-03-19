# ddns-cloudflare-javascript
Another DDNS Updater for Cloudflare written in Javascript.  
This will scan for all "A" records and update their IPs.

------------

Requirements
* Node.js and npm

Usage:
* Clone or download the repo
* Run `npm install` to install all necessary dependencies.
* Copy `parameters_example.json` to `parameters.json`
* Fill in `parameters.json` with information from your Cloudflare Account. You can remove the zones array to scan for all zones.
* Run `node main.js` to update records on Cloudflare.
* Make a cron job to run this every so often with `crontab -e`
Appending
`0 */2 * * * node /full/path/to/ddns-cloudflare-javascript/main.js /full/path/to/ddns-cloudflare-javascript/parameters.json >/dev/null 2>&1`

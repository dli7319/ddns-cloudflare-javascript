# ddns-cloudflare-javascript
Another DDNS Updater for Cloudflare written in Javascript.<br>
This will scan for all "A" records and update their IPs.

------------

Usage:
* Fill in `parameters_example.json` will information from your Cloudflare Account. You can remove the zones array to scan for all zones.
* Rename `parameters_example.json` to `parameters.json`
* Run `node main.js`
* Make a cron job to run this every so often with `crontab -e `<br>
Appending
`0 */2 * * * node /full/path/to/ddns-cloudflare-javascript/main.js >/dev/null 2>&1`

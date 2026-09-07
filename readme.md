# TimeAds conversion tracking

The public source for the JavaScript served by TimeAds at `/t.js`. The dashboard
uses a pinned build of this repository. No account credentials belong in a
browser tag.

## 1. Set up your campaign

Verify your website domain in **TimeAds → Conversions → Domains**. In your Click
campaign URL or Task Starting Link, include:

```text
https://your-site.example/landing?ta_clickid={clickid}
```

Use `&ta_clickid={clickid}` if the URL already has query parameters. TimeAds
replaces `{clickid}` with an encrypted, opaque click token. Do not generate,
decode or modify it. The URL parameter is `ta_clickid`; the request field is
`click_id`. There is no activation switch or configurable parameter name.

## 2. Install the global tag

Copy the global tag from **TimeAds → Conversions → JS Tag** onto your landing
page and subsequent conversion pages. Example (replace the origin with the one
in your dashboard snippet):

```html
<script async src="https://YOUR-TRACKING-ORIGIN/t.js"></script>
```

The tag automatically captures `ta_clickid`, saves it in your site's
`localStorage`, and records a landing. No cookies or browser encryption setup
is required. Storage is scoped to your website origin: another subdomain does
not share it. A new click token replaces the stored attribution. Without a
stored token, or when storage is blocked, tracking returns `false` and sends
nothing. Remove `ta_conv` from localStorage when your site's policy requires
clearing attribution. Apply your site's consent policy before loading the tag.

## 3. Record a conversion

Use your own stable, unique transaction ID, such as an order number. Run this on
your conversion page. The readiness check works whether the async tag has
already loaded or is still loading:

```html
<script>
function recordConversion() {
  TimeAdsTracking.track("ORDER-123", {
    event: "purchase",
    value: "18.57",
    tags: ["summer"]
  });
}
if (window.TimeAdsTracking) recordConversion();
else document.addEventListener("timeads:ready", recordConversion, { once: true });
</script>
```

Other examples, after the tag is ready:

```js
await TimeAdsTracking.track("SIGNUP-42", { event: "signup" });
await TimeAdsTracking.track("LEVEL-9", { event: "level_completed" });
```

- Transaction IDs: nonblank strings, maximum 80 UTF-8 bytes. Reuse the same ID
  when retrying the same conversion. Different conversions need different IDs.
- Events: `purchase`, `signup`, or a custom event name. The SDK maps custom
  names into the API's `custom` / `event_custom` fields (maximum 100 UTF-8 bytes).
- Purchase value must be positive. Other values may be zero. Maximum value is
  100000. Decimal strings are recommended to preserve precision; numbers are
  also accepted and serialized as strings.
- Tags: optional, at most three strings, each at most 50 UTF-8 bytes.
- Repeated conversions are deduplicated, **never used to overwrite values**.
  Value corrections require the authenticated Conversions API. The browser
  cannot send `update` events.
- `track()` and `land()` return promises resolving to `true` for an accepted or
  duplicate hit, otherwise `false`. There is no background retry loop. You may
  retry with the same transaction ID after a network failure.

### Single-page apps

Call `TimeAdsTracking.land()` after navigation introduces a new `ta_clickid`.
Repeated calls for the same successfully recorded landing send no additional
hit. Later conversions use the stored token even when the current URL has no
click parameter. Failed landings retain their transaction ID for safe retries.

### ES modules and self-hosting

Download a versioned ES build from [Releases](../../releases), serve it from
your application, and configure the HTTPS beacon endpoint shown by TimeAds:

```js
import TimeAdsTracking from "/vendor/conversion-tracking.es.js";
await TimeAdsTracking.configure({ endpoint: "https://YOUR-TRACKING-ORIGIN/track" });
await TimeAdsTracking.track("ORDER-123", { event: "purchase", value: "18.57" });
```

Configure the endpoint explicitly when hosting a browser bundle on your own
origin too; the default beacon address is `/track` on the script's origin.
This repository does not publish an npm package. Module imports are intended
for the browser (an import during server rendering returns `null`).

## API tracking

For server-side tracking, store the `ta_clickid` value when the visitor arrives
and pass it as `click_id` with your transaction ID to the authenticated API.
Keep the personal access token on your server, with `conversions:track` scope.

```sh
curl https://api.timeads.com/api/v1/conversions/track \
  -H "Authorization: Bearer YOUR_SERVER_SIDE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"click_id":"TOKEN_FROM_URL","transaction_id":"ORDER-123","event":"purchase","value":"18.57"}'
```

See the [Conversions API reference](https://docs.timeads.com/#tag/conversion-tracking/POST/api/v1/conversions/track)
for landing recording, value corrections and authentication requirements. Do
not record the same conversion through JS and API with different transaction
IDs. Domain verification gates browser hits; API calls use authentication and
campaign ownership checks.

## Troubleshooting

1. Confirm the landing URL contains a real token, not the literal `{clickid}`.
2. Check `TimeAdsTracking.token()` after the tag loads. `null` means no token is
   stored for this website origin.
3. Add `data-debug` to the global script or call
   `TimeAdsTracking.configure({ debug: true })` to see beacon status messages.
4. Inspect `/track` requests in the browser Network tab and the **Hits Log** in
   TimeAds. Invalid tokens, unverified domains and validation errors are
   rejected. Ad blockers or blocked storage can prevent a request altogether.
5. Conversion data appears on the **Statistics** page once recorded.

Runnable [landing](examples/landing.html) and [conversion](examples/conversion.html)
examples require a verified HTTPS website and your actual tracking origin.

## Development and releases

```sh
npm ci
npm test
```

The build emits readable ES, UMD and IIFE files in `build/`. Commit generated
bundles with source changes. CI tests the browser bundle and checks committed
artifacts. A `v` tag matching `package.json` publishes bundles and SHA-256
checksums as a GitHub release. TimeAds pins an exact source revision and embeds
its IIFE build; it never downloads code from GitHub while serving requests.

The Go API owns validation rules. TimeAds contract tests check these public
artifacts against its naming and validation rules before deployment.

## 5. License

This software is provided under a commercial license. Redistribution, modification, or use of this code in any form, for
any purpose other than explicitly authorized by TimeAds, is strictly prohibited.

### Legal Notice

Unauthorized reproduction or redistribution of this software may result in severe civil and criminal penalties.
Violators will be prosecuted to the maximum extent possible under the law.

© 2025 TimeAds. All rights reserved. 

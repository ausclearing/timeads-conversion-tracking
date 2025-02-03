# Conversion Tracking for TimeAds

## 1. Conversion Tracking

### 1.1. Conversion Tracking with TimeAds

The **Conversion Tracking for TimeAds** script provides a seamless way to monitor and track user actions on your site.
This lightweight and efficient tracking solution ensures accurate data collection for improved campaign insights.

## 2. Features

- Easy integration with any website.
- Lightweight script for minimal performance impact.
- Supports multiple tracking functions like `land` and more.
- Lets you add optional tags to help filter conversions in TimeAds.

## 3. Installation

### Using a `<script>` tag

Include the script in your webpage:

```html
TODO
```

### Using ES6 modules

Import the script in your JavaScript project:

```javascript
import ConversionTracking from 'TODO';

ConversionTracking.land();

```

## 4. Usage

### 4.1. Landing Page Tracking (`land`)

- **Requires** a session ID in the URL *(provided by TimeAds when a user starts a task)*.
- Call `land()` right when the user lands on the page

```javascript
ConversionTracking.land();
```

### 4.2. Custom Event Tracking (`track`)

Use `track()` to log specific user actions:

- `transactionId` *(mandatory)*: a unique ID for each transaction. If the same ID is used again, existing
  values will be updated.
- `event` *(mandatory)*: any string, minimum 5 characters. If using `ConversionTracking.EVENTS.PURCHASE`, a value is
  required.
- `value` (optional): must be a float if provided, and is mandatory for `PURCHASE` (it’s summed in TimeAds).
- `tags` (optional): up to 3 tags, each up to 50 characters, useful for filtering in TimeAds.

```javascript
ConversionTracking.track('tx_12345', {
    event: 'custom_event_name',
    value: 12.5,  // a float, if needed
    tags: ['tag1', 'tag2']
});
```

Purchase event example:

```javascript
ConversionTracking.track("tx_12345", {
    event: ConversionTracking.Event.PURCHASE,
    value: 99.99,
    tags: ["electronics", "promo"]
});
```

Signups event example:

```javascript
ConversionTracking.track("tx_67890", {
    event: ConversionTracking.Event.SIGNUP,
    tags: ["newsletter"]
});
```

## 5. License

This software is provided under a commercial license. Redistribution, modification, or use of this code in any form, for
any purpose other than explicitly authorized by TimeAds, is strictly prohibited.

### Legal Notice

Unauthorized reproduction or redistribution of this software may result in severe civil and criminal penalties.
Violators will be prosecuted to the maximum extent possible under the law.

© 2025 TimeAds. All rights reserved.
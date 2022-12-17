
# Twitch EventSub

A simple WebSocket based Twitch EventSub handler
## Installation

Install Twitch EventSub with npm

```bash
  npm install @ppauel/twitch-eventsub
```
## Usage

### Example

The following imports are used in this exampe:\
`Client`, `Subscription`, `SubscriptionEvents`

Define an array of subscriptions you want to receive.
```js
const subscriptions = [
    new Subscription({
        broadcasterId: "your broadcaster id",
        event: SubscriptionEvents.StreamOnline
    }),
    new Subscription({
        broadcasterId: "your broadcaster id",
        event: SubscriptionEvents.StreamOffline
    })
]
```

Next, define your client and pass in the `subscriptions` array.
```js
const client = new Client(subscriptions);
```

Once your client is connected, the `ready` event is emitted.
```js
client.on('ready', () => {
    console.log(`Ready! Listening to ${client.subscriptions.size} subscriptions...`);
});
```

Once a subscribed event is fired, an `event` is emitted. You can build a event handler using the parameters `event`, `eventName` and `broadcasterId`.
```js
client.on('event', (event, eventName, broadcasterId) => {
    switch (eventName) {
        case SubscriptionEvents.StreamOnline:
            console.log(`${event.broadcaster_user_name} is now online!`);
            break;

        case SubscriptionEvents.StreamOffline:
            console.log(`${event.broadcaster_user_name} is now offline!`);
            break;

        default:
            break;
    }
});
```

To log in your client, you will need your Client ID and an access token. You can find out how to generate one here: https://dev.twitch.tv/docs/authentication

```js
client.login({ clientId: "your client id", userToken: "your access token" });
```
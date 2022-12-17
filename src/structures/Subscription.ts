import { SubscriptionData } from "../util/Data";
import { request } from 'https';
import { RequestHosts, RequestPaths } from "../util/Paths";
import { SubscriptionEvents } from "../client/Client";

export class Subscription {
    public data: SubscriptionData;
    public subscribe(subscriptionOptions: SubscriptionOptions) {
        if (!this.data.condition.broadcaster_user_id.length) throw new Error("No broadcaster was defined");
        if (!this.data.type.length) throw new Error("No event was defined");

        this.data.transport.session_id = subscriptionOptions.sessionId;
        
        const postData = JSON.stringify(this.data);
        const options = {
            host: RequestHosts.BaseAPI,
            port: 443,
            path: RequestPaths.Subscription,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': `${subscriptionOptions.clientId}`,
                'Authorization': `Bearer ${subscriptionOptions.userToken}`
            }
        };

        const req = request(options, (res) => {
            var body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 202) {
                    // console.log();
                }
                else throw new Error(JSON.parse(body).message);
            });
        });
        req.on('error', (e) => console.error(e));
        req.write(postData)
        req.end()
    }
    constructor(options: ConstructorOptions) {
        this.data = {
            type: options.event,
            version: 1,
            condition: {
                broadcaster_user_id: options.broadcasterId
            },
            transport: {
                method: "websocket",
                session_id: ""
            }
        };
    }
}

interface ConstructorOptions {
    broadcasterId: string;
    event: SubscriptionEvents;
}

interface SubscriptionOptions {
    sessionId: string;
    userToken: string;
    clientId: string;
}
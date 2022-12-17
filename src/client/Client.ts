import { client as WebSocketClient, connection, IUtf8Message } from "websocket";
import { Collection } from '@discordjs/collection';
import EventEmitter from "events";
import { WebSocketPaths } from "../util/Paths";
import { Subscription } from "../structures/Subscription";
import { MessageTypes } from "../util/Enums";
// import { Event } from "../util/Data";

export declare interface Client {
    on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => void): this;
    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
}

export class Client extends EventEmitter {
    public userToken: ClientOptions['userToken'];
    public id: ClientOptions['clientId'];
    public eventSub: WebSocketClient;
    public subscriptions: Collection<string, Subscription>;
    public login(options: ClientOptions) {
        if (!this.subscriptions.size) throw new Error("No subscriptions were defined");
        this.userToken = options.userToken;
        this.id = options.clientId;
        this.eventSub.connect(WebSocketPaths.EventSub);
        this.eventSub.on('connect', (connection: connection) => {
            connection.on('message', (rawMessage) => {
                let message = JSON.parse((rawMessage as IUtf8Message).utf8Data);

                switch (message.metadata.message_type) {
                    case MessageTypes.SessionWelcome:
                        const sessionid = message.payload.session!.id;

                        this.subscriptions.each(subscription => subscription.subscribe({ sessionId: sessionid, userToken: this.userToken, clientId: this.id }));
                        this.emit('ready', this);
                        break;

                    case MessageTypes.Notification:
                        const broadcasterId = message.payload.subscription.condition.broadcaster_user_id;
                        const eventName = message.payload.subscription.type;
                        const subscription = this.subscriptions.get(formatKey(eventName, broadcasterId));

                        if (subscription) this.emit('event', message.payload.event, eventName, broadcasterId);
                        break;

                    case MessageTypes.SessionKeepAlive:
                        break;

                    default:
                        break;
                }
            });
        });
    }
    public constructor(subscriptions: Subscription[]) {
        super({ captureRejections: true });
        this.subscriptions = new Collection();
        this.eventSub = new WebSocketClient();
        this.userToken = "";
        this.id = "";

        for (const subscription of subscriptions) {
            const eventName = subscription.data.type;
            const broadcasterId = subscription.data.condition.broadcaster_user_id;
            this.subscriptions.set(formatKey(eventName, broadcasterId), subscription);
        }
    }
}

interface ClientOptions {
    userToken: string;
    clientId: string;
}

export interface ClientEvents {
    ready: [client: Client];
    event: [event: any, eventName: string, broadcasterId: string]; // ToDo: Event interface
}

// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types
export enum SubscriptionEvents {
    ChannelBan = "channel.ban",
    ChannelUnban = "channel.unban",
    ChannelCheer = "channel.cheer",
    ChannelRaid = "channel.raid",
    ChannelFollow = "channel.follow",
    ChannelUpdate = "channel.update",
    ChannelSubscribe = "channel.subscribe",
    ChannelSubscriptionEnd = "channel.subscription.end",
    ChannelSubscriptionGift = "channel.subscription.gift",
    ChannelSubscriptionMessage = "channel.subscription.message",
    ChannelModeratorAdd = "channel.moderator.add",
    ChannelModeratorRemove = "channel.moderator.remove",
    ChannelPointsCustomRewardAdd = "channel.channel_points_custom_reward.add",
    ChannelPointsCustomRewardUpdate = "channel.channel_points_custom_reward.update",
    ChannelPointsCustomRewardRemove = "channel.channel_points_custom_reward.remove",
    ChannelPointsCustomRewardRedemptionAdd = "channel.channel_points_custom_reward_redemption.add",
    ChannelPointsCustomRewardRedemptionUpdate = "channel.channel_points_custom_reward_redemption.update",
    ChannelPollBegin = "channel.poll.begin",
    ChannelPollProgress = "channel.poll.progress",
    ChannelPollEnd = "channel.poll.end",
    ChannelPredictionBegin = "channel.prediction.begin",
    ChannelPredictionProgress = "channel.prediction.progress",
    ChannelPredictionLock = "channel.prediction.lock",
    ChannelPredictionEnd = "channel.prediction.end",
    DropEntitlementGrant = "drop.entitlement.grant",
    ExtensionBitsTransactionCreate = "extension.bits_transaction.create",
    GoalBegin = "channel.goal.begin",
    GoalProgress = "channel.goal.progress",
    GoalEnd = "channel.goal.end",
    HypeTrainBegin = "channel.hype_train.begin",
    HypeTrainProgress = "channel.hype_train.progress",
    HypeTrainEnd = "channel.hype_train.end",
    StreamOnline = "stream.online",
    StreamOffline = "stream.offline",
    UserAuthorizationGrant = "user.authorization.grant",
    UserAuthorizationRevoke = "user.authorization.revoke",
    UserUpdate = "user.update"
}

export function formatKey(eventName: string, broadcasterId: string) {
    return `${eventName}*${broadcasterId}`;
}

export function parseKey(key: string) {
    return key.split('*');
}
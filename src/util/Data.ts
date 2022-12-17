export type SubscriptionData = {
    type: string,
    version: 1,
    condition: {
        broadcaster_user_id: string
    },
    transport: {
        method: "websocket",
        session_id: string,
    }
}

export type Event = {
    user_id?: string,
    user_login?: string,
    user_name?: string,
    broadcaster_user_id?: string,
    broadcaster_user_login?: string,
    broadcaster_user_name?: string
}

export type APIMessage = {
    metadata: {
        message_id: string,
        message_type: string,
        message_timestamp: string
    },
    payload: {
        session?: {
            id: string
            status: string,
            connected_at: string,
            keepalive_timeout_seconds: number,
            reconnect_url: string | null
        },
        subscription?: {
            type: string,
            created_at?: string
        },
        event?: {
            broadcaster_user_name: string
        }
    }
}

export type APINotification = {
    metadata: {
        message_id: string,
        message_type: string,
        message_timestamp: string
    },
    payload: {
        session?: {
            id: string
            status: string,
            connected_at: string,
            keepalive_timeout_seconds: number,
            reconnect_url: string | null
        },
        subscription?: {
            type: string,
            created_at?: string
        },
        event?: {
            broadcaster_user_name: string
        }
    }
}
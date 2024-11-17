export interface Message {
    object?: string;         // Optional property
    content?: string;        // Optional property
    status?: Record<string, any>; // Optional object with dynamic properties
    campaign_id?: number;    // Optional property
    audience_id?: number;    // Optional property
}

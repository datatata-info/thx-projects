export interface MqttMessageItem {
    value: any;
    creator: boolean;
    sentTime: Date;
    userId?: string;
    name?: string;
    command?: string;
    // update?: boolean;
}

export interface MqttMessage {
    destinationName: string;
    message: MqttMessageItem;
}

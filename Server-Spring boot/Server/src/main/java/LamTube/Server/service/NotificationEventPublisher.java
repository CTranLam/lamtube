package LamTube.Server.service;

import LamTube.Server.dto.notification.NotificationEventPayload;

public interface NotificationEventPublisher {
    void publish(String routingKey, NotificationEventPayload payload);
}

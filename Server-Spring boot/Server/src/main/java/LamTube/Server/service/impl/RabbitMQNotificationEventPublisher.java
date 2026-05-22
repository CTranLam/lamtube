package LamTube.Server.service.impl;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import LamTube.Server.configuration.RabbitMQConfig;
import LamTube.Server.dto.notification.NotificationEventPayload;
import LamTube.Server.service.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RabbitMQNotificationEventPublisher implements NotificationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publish(String routingKey, NotificationEventPayload payload) {
        if (routingKey == null || routingKey.isBlank() || payload == null) {
            return;
        }

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send(routingKey, payload);
                }
            });
            return;
        }

        send(routingKey, payload);
    }

    private void send(String routingKey, NotificationEventPayload payload) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE, routingKey, payload);
    }
}

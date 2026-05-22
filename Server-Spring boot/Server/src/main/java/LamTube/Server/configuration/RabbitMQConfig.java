package LamTube.Server.configuration;

import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    //Queue chính và Queue lỗi
    public static final String NOTIFICATION_QUEUE = "notification_queue";
    public static final String NOTIFICATION_DLQ = "notification_dlq";
    
    //Exchange
    public static final String NOTIFICATION_EXCHANGE = "notification_exchange";
    
    // Routing Key dạng pattern (notification.video.like, notification.channel.subscribe)
    public static final String NOTIFICATION_ROUTING_KEY = "notification.#";
    public static final String ROUTING_VIDEO_LIKE = "notification.video.like";
    public static final String ROUTING_VIDEO_DISLIKE = "notification.video.dislike";
    public static final String ROUTING_VIDEO_COMMENT = "notification.video.comment";
    public static final String ROUTING_CHANNEL_SUBSCRIBE = "notification.channel.subscribe";

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", "") // Default exchange
                .withArgument("x-dead-letter-routing-key", NOTIFICATION_DLQ)
                .build();
    }

    @Bean
    public Queue notificationDeadLetterQueue() {
        return new Queue(NOTIFICATION_DLQ);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
                .bind(notificationQueue())
                .to(notificationExchange())
                .with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2JsonMessageConverter());
        return template;
    }

    @Bean("notificationListenerFactory")
    public SimpleRabbitListenerContainerFactory notificationListenerFactory(
            ConnectionFactory connectionFactory,
            RabbitTemplate rabbitTemplate) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jackson2JsonMessageConverter());

        // Cơ chế Retry và đẩy vào DLQ khi thất bại
        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxAttempts(3)
                        .backOffOptions(1000, 2.0, 5000) // Đợi 1s -> 2s -> 4s
                        .recoverer(new RepublishMessageRecoverer(
                                rabbitTemplate,
                                "", // Gửi thẳng vào DLQ qua default exchange
                                NOTIFICATION_DLQ
                        ))
                        .build()
        );

        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}

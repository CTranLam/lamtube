package LamTube.Server.configuration;

import java.net.URI;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
public class RustFsS3Config {

    @Bean
    public S3Client rustFsS3Client(RustFsProperties rustFsProperties) {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            rustFsProperties.getAccessKey(),
            rustFsProperties.getSecretKey()
        );

        return S3Client.builder()
            .endpointOverride(URI.create(rustFsProperties.getInternalUrl()))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.US_EAST_1)
            .serviceConfiguration(S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build())
            .build();
    }
}

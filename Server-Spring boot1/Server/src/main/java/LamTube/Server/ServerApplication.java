package LamTube.Server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import LamTube.Server.configuration.RustFsProperties;

@SpringBootApplication
@EnableConfigurationProperties(RustFsProperties.class)
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

}

package LamTube.Server.dto.base;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResponseDTO<T> {
    private String message;
    private T data;
}

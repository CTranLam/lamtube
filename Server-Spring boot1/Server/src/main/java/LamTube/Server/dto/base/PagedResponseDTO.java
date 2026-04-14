package LamTube.Server.dto.base;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PagedResponseDTO<T> {
    private List<T> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}

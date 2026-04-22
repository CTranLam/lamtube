package LamTube.Server.dto;

import java.util.List;

import lombok.Data;

@Data
public class WatchHistoryGroupDTO {
    private String date;
    private String label;
    private List<WatchHistoryItemDTO> items;
}

package LamTube.Server.service;

import java.util.List;

import LamTube.Server.dto.CategoryCreateDTO;
import LamTube.Server.dto.CategoryResponseDTO;
import LamTube.Server.dto.CategoryUpdateDTO;
import LamTube.Server.dto.base.PagedResponseDTO;

public interface ICategoryService {
    PagedResponseDTO<CategoryResponseDTO> getAllCategories(String keyword, int page, int size);

    CategoryResponseDTO createCategory(CategoryCreateDTO dto);

    CategoryResponseDTO updateCategory(Long id, CategoryUpdateDTO dto);

    void deleteCategory(Long id);

    List<CategoryResponseDTO> getAllCategories();
}

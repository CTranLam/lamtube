package LamTube.Server.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import LamTube.Server.dto.CategoryCreateDTO;
import LamTube.Server.dto.CategoryResponseDTO;
import LamTube.Server.dto.CategoryUpdateDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.model.CategoryEntity;
import LamTube.Server.repository.CategoryRepository;
import LamTube.Server.service.ICategoryService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements ICategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDTO<CategoryResponseDTO> getAllCategories(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<CategoryEntity> categoriesPage;
        if (keyword != null && !keyword.isBlank()) {
            categoriesPage = categoryRepository.findByIsDeletedFalseAndNameContainingIgnoreCase(keyword, pageable);
        } else {
            categoriesPage = categoryRepository.findAllByIsDeletedFalse(pageable);
        }

        List<CategoryResponseDTO> items = categoriesPage.stream()
                .map(c -> new CategoryResponseDTO(c.getId(), c.getName()))
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
            items,
            categoriesPage.getNumber(),
            categoriesPage.getSize(),
            categoriesPage.getTotalElements(),
            categoriesPage.getTotalPages()
        );
    }

    @Override
    public CategoryResponseDTO createCategory(CategoryCreateDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Tên danh mục không được để trống");
        }

        if (categoryRepository.existsByNameAndIsDeletedFalse(dto.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }

        CategoryEntity entity = new CategoryEntity();
        entity.setName(dto.getName().trim());
        entity.setIsDeleted(false);

        CategoryEntity saved = categoryRepository.save(entity);
        return new CategoryResponseDTO(saved.getId(), saved.getName());
    }

    @Override
    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateDTO dto) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        if (Boolean.TRUE.equals(entity.getIsDeleted())) {
            throw new RuntimeException("Danh mục đã bị xóa");
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            String newName = dto.getName().trim();
            if (!newName.equals(entity.getName())
                    && categoryRepository.existsByNameAndIsDeletedFalse(newName)) {
                throw new RuntimeException("Tên danh mục đã tồn tại");
            }
            entity.setName(newName);
        }

        CategoryEntity saved = categoryRepository.save(entity);
        return new CategoryResponseDTO(saved.getId(), saved.getName());
    }

    @Override
    public void deleteCategory(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        if (Boolean.TRUE.equals(entity.getIsDeleted())) {
            return; // đã xóa rồi thì thôi
        }

        entity.setIsDeleted(true);
        categoryRepository.save(entity);
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        List<CategoryEntity> categories = categoryRepository.findAllByIsDeletedFalseOrderByNameAsc();
        return categories.stream()
                .map(category -> new CategoryResponseDTO(category.getId(), category.getName()))
                .collect(Collectors.toList());
    }
}

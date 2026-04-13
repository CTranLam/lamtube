package LamTube.Server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import LamTube.Server.dto.UserInfoAdminUpdateDTO;
import LamTube.Server.dto.UserInforAdminDTO;
import LamTube.Server.dto.UserRequestCreateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.CategoryCreateDTO;
import LamTube.Server.dto.CategoryResponseDTO;
import LamTube.Server.dto.CategoryUpdateDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.service.IRoleService;
import LamTube.Server.service.IUserService;
import LamTube.Server.service.ICategoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final IUserService userService;
    private final IRoleService roleService;
    private final ICategoryService categoryService;

    @GetMapping("/users")
    public ResponseEntity<ResponseDTO<PagedResponseDTO<UserResponseDTO>>> getAllUsers(
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        PagedResponseDTO<UserResponseDTO> users = userService.getAllUsers(email, role, page, size);
        return ResponseEntity.ok(new ResponseDTO<>("Danh sách tài khoản", users));
    }

    @PostMapping("/user")
    public ResponseEntity<ResponseDTO<UserResponseDTO>> createUser(@RequestBody UserRequestCreateDTO createDTO) {
        UserResponseDTO user = userService.createUser(createDTO);
        return ResponseEntity.ok(new ResponseDTO<>("Tạo tài khoản thành công", user));
    }

    @GetMapping("/roles")
    public ResponseEntity<ResponseDTO<List<String>>> getAllRoles() {
        List<String> roles = roleService.getAllRoles();
        return ResponseEntity.ok(new ResponseDTO<>("Danh sách vai trò", roles));
    }

        @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDTO<UserInforAdminDTO>> getUserById(@PathVariable Long userId) {
        UserInforAdminDTO userInfo = userService.getUserById(userId);
        return ResponseEntity.ok(new ResponseDTO<>("Thông tin tài khoản", userInfo));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<ResponseDTO<String>> updateUser(@PathVariable Long userId, @RequestBody UserInfoAdminUpdateDTO updateDTO) {
        userService.updateUserInfo(userId, updateDTO);
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật tài khoản thành công", null));
     }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ResponseDTO<String>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ResponseDTO<>("Xóa tài khoản thành công", null));  
    }

    // Categories

    @GetMapping("/categories")
    public ResponseEntity<ResponseDTO<PagedResponseDTO<CategoryResponseDTO>>> getAllCategories(
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        PagedResponseDTO<CategoryResponseDTO> categories = categoryService.getAllCategories(keyword, page, size);
        return ResponseEntity.ok(new ResponseDTO<>("Danh sách danh mục", categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ResponseDTO<CategoryResponseDTO>> createCategory(@RequestBody CategoryCreateDTO dto) {
        CategoryResponseDTO created = categoryService.createCategory(dto);
        return ResponseEntity.ok(new ResponseDTO<>("Tạo danh mục thành công", created));
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<ResponseDTO<CategoryResponseDTO>> updateCategory(
        @PathVariable Long categoryId,
        @RequestBody CategoryUpdateDTO dto
    ) {
        CategoryResponseDTO updated = categoryService.updateCategory(categoryId, dto);
        return ResponseEntity.ok(new ResponseDTO<>("Cập nhật danh mục thành công", updated));
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ResponseDTO<String>> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(new ResponseDTO<>("Xóa danh mục thành công", null));
    }

}

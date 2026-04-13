package LamTube.Server.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import LamTube.Server.dto.CategoryResponseDTO;
import LamTube.Server.dto.UserLoginDTO;
import LamTube.Server.dto.UserRegisterDTO;
import LamTube.Server.dto.UserRegisterResponseDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.service.ICategoryService;
import LamTube.Server.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GuestController {

    private final IUserService userService;
    private final ICategoryService categoryService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO<?>> registerUser(@RequestBody UserRegisterDTO userRegisterDTO, BindingResult result) {
        try{
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest()
                        .body(new ResponseDTO<>("Lỗi validation", errorMessages));
            }
            if (!userRegisterDTO.getPassword().equals(userRegisterDTO.getRetypedPassword())) {
                return ResponseEntity.badRequest()
                        .body(new ResponseDTO<>("Mật khẩu nhập lại không khớp", null));
            }
            UserRegisterResponseDTO userRegisterResponseDTO = userService.createUser(userRegisterDTO);
            return ResponseEntity.ok(
                    new ResponseDTO<>("Đăng ký thành công", userRegisterResponseDTO)
            );

        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<?>> login(@Valid @RequestBody UserLoginDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest()
                    .body(new ResponseDTO<>("Lỗi validation", errors));
        }

        try {
            UserResponseDTO userResponseDTO = userService.findByEmail(userDTO.getEmail());
            if (userResponseDTO == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO<>("Tài khoản không tồn tại", null));
            }
            UserLoginDTO loginDTO = new UserLoginDTO();
            loginDTO.setEmail(userDTO.getEmail());
            loginDTO.setPassword(userDTO.getPassword());
            String token = userService.login(loginDTO);
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDTO<>("Sai mật khẩu", null));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", userResponseDTO.getEmail());
            response.put("id", userResponseDTO.getUserId());
            response.put("role", userResponseDTO.getRole());

            return ResponseEntity.ok(
                    new ResponseDTO<>("Đăng nhập thành công", response)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ResponseDTO<List<CategoryResponseDTO>>> getAllCategories() {
        try {
            List<CategoryResponseDTO> categories = categoryService.getAllCategories(); 
            return ResponseEntity.ok(
                    new ResponseDTO<>("Lấy danh sách danh mục thành công", categories)
            );
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO<>(e.getMessage(), null));
        }
    }
}

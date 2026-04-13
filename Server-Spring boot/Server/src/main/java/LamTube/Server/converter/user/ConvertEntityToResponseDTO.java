package LamTube.Server.converter.user;

import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.UserProfileEntity;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class ConvertEntityToResponseDTO {

	public static UserResponseDTO toUserResponseDTO(UserEntity user) {
		if (user == null) return null;
		String role = user.getRole() != null ? user.getRole().getName() : null;
		return new UserResponseDTO(user.getId(), user.getEmail(), role);
	}

	public static List<UserResponseDTO> toUserResponseDTOList(List<UserEntity> users) {
		if (users == null) return null;
		return users.stream()
				.filter(Objects::nonNull)
				.map(ConvertEntityToResponseDTO::toUserResponseDTO)
				.collect(Collectors.toList());
	}

	public static UserInfoResponseDTO toUserInfoResponseDTO(UserProfileEntity profile) {
		if (profile == null) return null;
		UserInfoResponseDTO dto = new UserInfoResponseDTO();
		dto.setId(profile.getUser() != null ? profile.getUser().getId() : null);
		dto.setEmail(profile.getUser() != null ? profile.getUser().getEmail() : null);
		dto.setFullname(profile.getFullName());
		dto.setAvatarUrl(profile.getAvatarUrl());
		dto.setBio(profile.getBio());
		return dto;
	}

}


package LamTube.Server.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import LamTube.Server.model.RoleEntity;
import LamTube.Server.repository.RoleRepository;
import LamTube.Server.service.IRoleService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {

    private final RoleRepository roleRepository;
    @Override
    public List<String> getAllRoles() {
        return roleRepository.findAll().stream().map(RoleEntity::getName).toList();
    }

    
    
}

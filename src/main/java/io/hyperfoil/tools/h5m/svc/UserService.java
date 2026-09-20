package io.hyperfoil.tools.h5m.svc;

import io.hyperfoil.tools.h5m.api.Role;
import io.hyperfoil.tools.h5m.api.User;
import io.hyperfoil.tools.h5m.api.svc.UserServiceInterface;
import io.hyperfoil.tools.h5m.entity.UserEntity;
import io.hyperfoil.tools.h5m.entity.mapper.ApiMapper;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.hibernate.Session;

import java.util.List;

@ApplicationScoped
public class UserService implements UserServiceInterface {

    @Inject
    ApiMapper apiMapper;

    @Inject
    SecurityIdentity identity;

    @Inject
    Session session;

    @Override
    @Transactional
    public User resolveUser() {
        return apiMapper.toUser(resolveUserEntity());
    }

    @SuppressWarnings("SwitchStatementWithTooFewBranches")
    private UserEntity resolveUserEntity() {
        return switch (identity.getPrincipal()) {
            case JsonWebToken jwt -> findBySubAndIss(jwt.getSubject(), jwt.getIssuer());
            default -> UserEntity.find("username", identity.getPrincipal().getName()).firstResult();
        };
    }

    private UserEntity findBySubAndIss(String sub, String iss) {
        return session.createQuery(
                        "from h5m_user where sub = :sub and iss = :iss", UserEntity.class)
                .setParameter("sub", sub)
                .setParameter("iss", iss)
                .setCacheable(true)
                .uniqueResult();
    }

    @Override
    @Transactional
    public long create(String username, Role role) {
        UserEntity user = new UserEntity(username, role);
        user.persist();
        return user.id;
    }

    @Override
    @Transactional
    public long create(String sub, String iss, String username, Role role) {
        UserEntity user = new UserEntity(sub, iss, username, role);
        user.persist();
        return user.id;
    }

    @Override
    @Transactional
    public User byUsername(String username) {
        UserEntity entity = UserEntity.find("username", username).firstResult();
        return apiMapper.toUser(entity);
    }

    @Transactional
    public User bySub(String sub, String iss) {
        return apiMapper.toUser(findBySubAndIss(sub, iss));
    }

    @Override
    @Transactional
    public List<User> list() {
        List<UserEntity> entities = UserEntity.listAll();
        return entities.stream().map(apiMapper::toUser).toList();
    }

    @Override
    @Transactional
    public void setRole(long userId, Role role) {
        UserEntity user = UserEntity.findById(userId);
        if (user != null) {
            user.role = role;
        }
    }

    @Override
    @Transactional
    public long count() {
        return UserEntity.count();
    }
}

package io.hyperfoil.tools.h5m.api;

import java.util.Set;

/**
 * User metadata DTO. Used at the API boundary instead of the JPA entity.
 *
 * <p>{@code teamIds} carries the ids of the teams the user belongs to; it is resolved once at authentication and
 * materialised as {@code H5M.TEAM.<id>} pseudo-roles on the SecurityIdentity.
 */
public record User(long id, String username, Role role, Set<Long> teamIds) {}

package io.hyperfoil.tools.h5m.api;

public enum Role {

    ADMIN, USER;

    public static final String ADMIN_ROLE = "ADMIN", USER_ROLE = "USER";

    /** Prefix for the per-team pseudo-roles added to the SecurityIdentity to represent team membership. */
    public static final String TEAM_ROLE_PREFIX = "H5M.TEAM.";

    /** Build the pseudo-role string representing membership of the given team. */
    public static String teamRole(long teamId) {
        return TEAM_ROLE_PREFIX + teamId;
    }

}

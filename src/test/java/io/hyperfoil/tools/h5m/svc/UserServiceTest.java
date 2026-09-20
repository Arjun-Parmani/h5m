package io.hyperfoil.tools.h5m.svc;

import io.hyperfoil.tools.h5m.FreshDb;
import io.hyperfoil.tools.h5m.api.Role;
import io.hyperfoil.tools.h5m.api.User;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class UserServiceTest extends FreshDb {

    @Inject
    UserService userService;

    @Inject
    SessionFactory sessionFactory;

    @Test
    void create_user() {
        long id = userService.create("stalep", Role.ADMIN);
        assertTrue(id > 0);
        User user = userService.byUsername("stalep");
        assertNotNull(user);
        assertEquals("stalep", user.username());
        assertEquals(Role.ADMIN, user.role());
    }

    @Test
    void list_users() {
        userService.create("alice", Role.USER);
        userService.create("bob", Role.ADMIN);
        List<User> users = userService.list();
        assertEquals(2, users.size());
    }

    @Test
    void set_role() {
        long id = userService.create("carol", Role.USER);
        userService.setRole(id, Role.ADMIN);
        User user = userService.byUsername("carol");
        assertEquals(Role.ADMIN, user.role());
    }

    @Test
    void count() {
        assertEquals(0, userService.count());
        userService.create("one", Role.USER);
        userService.create("two", Role.USER);
        assertEquals(2, userService.count());
    }

    @Test
    void byUsername_returns_null_for_missing() {
        assertNull(userService.byUsername("nonexistent"));
    }

    @Test
    void bySub_second_lookup_is_query_cache_hit() {
        String sub = "sub-123";
        String iss = "https://issuer.example";
        userService.create(sub, iss, "oidc-user", Role.USER);

        Statistics stats = sessionFactory.getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        // First lookup: nothing cached yet -> query-cache miss, result cached.
        User first = userService.bySub(sub, iss);
        assertNotNull(first, "first lookup should resolve the user");
        assertEquals("oidc-user", first.username());

        long hitsAfterFirst = stats.getQueryCacheHitCount();
        long missesAfterFirst = stats.getQueryCacheMissCount();
        assertEquals(0, hitsAfterFirst, "first identical lookup should not be a cache hit");
        assertTrue(missesAfterFirst >= 1,
                "first lookup should register a query-cache miss (setCacheable is active), was " + missesAfterFirst);

        // Second identical lookup: served from the query cache.
        User second = userService.bySub(sub, iss);
        assertNotNull(second, "second lookup should resolve the user");
        assertEquals("oidc-user", second.username());

        assertEquals(hitsAfterFirst + 1, stats.getQueryCacheHitCount(),
                "second identical lookup should be a query-cache hit, not another miss");
    }
}

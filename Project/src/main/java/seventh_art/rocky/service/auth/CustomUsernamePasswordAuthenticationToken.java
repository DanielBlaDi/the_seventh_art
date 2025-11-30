package seventh_art.rocky.service.auth;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

public class CustomUsernamePasswordAuthenticationToken 
        extends UsernamePasswordAuthenticationToken {

    public CustomUsernamePasswordAuthenticationToken(
            Object principal, 
            Object credentials, 
            java.util.Collection authorities
    ) {
        super(principal, credentials, authorities);
    }

    @Override
    public String getName() {
        return (String) this.getPrincipal(); // <-- email
    }
}

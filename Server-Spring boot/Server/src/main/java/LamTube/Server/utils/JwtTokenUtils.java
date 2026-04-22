package LamTube.Server.utils;

import java.security.InvalidParameterException;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenUtils {
    private final int accessExpiration;
    private final int refreshExpiration;
    private final String secretKey;

    public JwtTokenUtils(
            @Value("${app.jwt.access-expiration-seconds}") int accessExpiration,
            @Value("${app.jwt.refresh-expiration-seconds}") int refreshExpiration,
            @Value("${app.jwt.secret-key}") String secretKey) {
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
        this.secretKey = secretKey;
    }


    public String generateAccessToken(String username) {
        return generateToken(username, accessExpiration, "access");
    }

    public String generateRefreshToken(String username) {
        return generateToken(username, refreshExpiration, "refresh");
    }

    private String generateToken(String username, int expirationSeconds, String tokenType) {
        Map<String, Object> claims = new HashMap<>(); // map chua thong tin payload
        claims.put("userName", username);
        claims.put("tokenType", tokenType);
        try{
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(username)
                    .setExpiration(new Date(System.currentTimeMillis() + expirationSeconds*1000L))
                    .signWith(getSignKey(), SignatureAlgorithm.HS256) // tao signature
                    .compact();
            return token;
        }catch(Exception e){
            throw new InvalidParameterException("Cannot generate Jwt Token, error: " + e.getMessage());
        }
    }

    // ma hoa key ve dang nhi phan
    private Key getSignKey() {
        byte[] bytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(bytes);
    }

    // giai ma xac thuc token, tra ve thong tin ng dung trong payload
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey()) // gan secretKey
                .build()
                .parseClaimsJws(token)// giai ma token, check signature
                .getBody(); // lay ra payload
    }

    public <T> T extractClaims(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenExpired(String token) {
        Date expiration = extractClaims(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaims(token, claims -> claims.get("tokenType", String.class));
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return validateToken(token, userDetails, "access");
    }

    public boolean validateToken(String token, UserDetails userDetails, String expectedTokenType) {
        String username = extractUsername(token);
        String tokenType = extractTokenType(token);
        return (username.equals(userDetails.getUsername())
                && !isTokenExpired(token)
                && expectedTokenType.equalsIgnoreCase(tokenType));
    }
}

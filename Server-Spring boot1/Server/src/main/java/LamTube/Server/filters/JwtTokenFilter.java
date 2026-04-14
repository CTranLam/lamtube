package LamTube.Server.filters;

import java.util.Arrays;
import java.util.List;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.AntPathMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import LamTube.Server.utils.JwtTokenUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtTokenFilter extends OncePerRequestFilter {
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtils jwtTokenUtil;


    //v1 check token de xac thuc
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try{
            if(isBypassToken(request)) { // khong can ktra token nua ma van co the tiep tuc di ra web config
                filterChain.doFilter(request, response); //enable bypass
                return;
            }
            final String authHeader = request.getHeader("Authorization");
            if(authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response); 
                return;
            }

            final String token = authHeader.substring(7);
            final String userName = jwtTokenUtil.extractUsername(token);
            // lay securityContext => lay doi tuong authentication luu thong tin nguoi dung trong context
            if(userName != null && SecurityContextHolder.getContext().getAuthentication() == null) { // Người dùng chưa được xác thực => cần kiểm tra token
                UserDetails userDetails = userDetailsService.loadUserByUsername(userName);
                if(jwtTokenUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()); //user chua userName, password, listRole
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
            filterChain.doFilter(request, response); // di tiep sang filter chua requestMatcher
        }catch (Exception ex){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,"Unauthorized");
        }
    }

    private boolean isBypassToken(HttpServletRequest request) {

        final List<String> bypassPostPaths = Arrays.asList(
                "/api/register",
                "/api/login",
                "/error",
                "/api/categories"
        );

        for (String path : bypassPostPaths) {
            if (pathMatcher.match(path, request.getServletPath())
                    && "POST".equalsIgnoreCase(request.getMethod())) {
                return true;
            }
        }
        return false;
    }
}

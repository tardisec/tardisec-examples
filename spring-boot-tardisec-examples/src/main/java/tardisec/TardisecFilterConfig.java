package tardisec;

import java.io.IOException;
import java.nio.file.Path;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/** Spring Boot registration for TardisecFilter. Wiring only. */
@Configuration
public class TardisecFilterConfig {

    @Bean
    public FilterRegistrationBean<TardisecFilter> tardisecFilter() throws IOException {
        // Parsed here rather than in the filter's init, so a missing or malformed manifest fails
        // the context refresh at startup instead of the first request.
        TardisecFilter filter = new TardisecFilter(TardisecFilter.headersFrom(Path.of(".tardisec.json")));

        FilterRegistrationBean<TardisecFilter> registration = new FilterRegistrationBean<>(filter);
        registration.addUrlPatterns("/*");
        // Ahead of Spring Security and everything else, so the headers are on responses that
        // never reach a controller: a 401 from the security chain, a 404 from the dispatcher.
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}

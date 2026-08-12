package tardisec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Servlet filter that puts .tardisec.json's http.headers on every response. They go on before
 * the chain runs, so anything the app sets itself overwrites them. Works in any Jakarta
 * Servlet 5+ container; the Spring Boot registration is in TardisecFilterConfig.
 */
public final class TardisecFilter implements Filter {

    private Map<String, String> headers;

    /** For container registration (web.xml or {@code @WebFilter}), which needs a no-arg constructor. */
    public TardisecFilter() {
    }

    /** For programmatic registration, where the caller has already parsed the manifest. */
    public TardisecFilter(Map<String, String> headers) {
        this.headers = headers;
    }

    /**
     * Reads the manifest once. Jackson is the JSON library here because Spring Boot already has
     * it; any other one works, this is six lines.
     */
    public static Map<String, String> headersFrom(Path manifest) throws IOException {
        JsonNode node = new ObjectMapper().readTree(Files.readString(manifest)).path("http").path("headers");
        Map<String, String> map = new LinkedHashMap<>();
        node.fields().forEachRemaining(field -> map.put(field.getKey(), field.getValue().asText()));
        return map;
    }

    @Override
    public void init(FilterConfig config) {
        if (headers != null) {
            return;
        }
        // Container-registered: read the path from an init-param, defaulting to the working
        // directory. Parsed once at startup, not per request; the file only changes via the sync.
        String path = config.getInitParameter("manifestPath");
        try {
            headers = headersFrom(Path.of(path == null ? ".tardisec.json" : path));
        } catch (IOException error) {
            throw new UncheckedIOException("tardisec manifest not readable", error);
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Before the chain, not after: setHeader on a committed response is a silent no-op, and
        // anything downstream that writes a body commits it. That ordering is also what lets the
        // app win, since its own setHeader later simply overwrites this one; containsHeader here
        // only defers to a filter or container that got there first.
        headers.forEach((name, value) -> {
            if (!httpResponse.containsHeader(name)) {
                httpResponse.setHeader(name, value);
            }
        });

        chain.doFilter(request, response);
    }
}

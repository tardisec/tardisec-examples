<?php

declare(strict_types=1);

namespace Tardisec;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Laravel middleware. Register it globally in bootstrap/app.php (Laravel 11+) or in the
 * $middleware array of app/Http/Kernel.php (Laravel 10 and earlier); see the README.
 */
final class LaravelMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Laravel's Response wraps Symfony's HeaderBag, so the check and the write are the same
        // two calls as the Symfony subscriber. Skip what the app already set.
        foreach (TardisecHeaders::all() as $name => $value) {
            if (!$response->headers->has($name)) {
                $response->headers->set($name, $value);
            }
        }

        return $response;
    }
}

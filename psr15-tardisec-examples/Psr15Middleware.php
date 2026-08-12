<?php

declare(strict_types=1);

namespace Tardisec;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * PSR-15 middleware, for Slim, Mezzio, Laminas, Yii, or any framework with a PSR-15 pipeline.
 */
final class Psr15Middleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);

        foreach (TardisecHeaders::all() as $name => $value) {
            if (!$response->hasHeader($name)) {
                // PSR-7 messages are immutable: withHeader returns a new instance and changes
                // nothing in place, so the return value has to be reassigned or the header is
                // silently dropped. This is the one difference from the other two adapters.
                $response = $response->withHeader($name, $value);
            }
        }

        return $response;
    }
}

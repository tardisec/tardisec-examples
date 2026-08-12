<?php

declare(strict_types=1);

namespace Tardisec;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Symfony event subscriber on kernel.response. With autoconfiguration on, implementing
 * EventSubscriberInterface is the whole registration; see the README otherwise.
 */
final class SymfonySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => 'onKernelResponse'];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        // Sub-requests (ESI fragments, forwards) never reach the browser on their own, and
        // their headers are discarded, so only the main request is worth decorating.
        if (!$event->isMainRequest()) {
            return;
        }

        $headers = $event->getResponse()->headers;
        foreach (TardisecHeaders::all() as $name => $value) {
            if (!$headers->has($name)) {
                $headers->set($name, $value);
            }
        }
    }
}

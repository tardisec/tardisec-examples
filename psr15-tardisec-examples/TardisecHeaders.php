<?php

declare(strict_types=1);

namespace Tardisec;

/**
 * The header map from .tardisec.json, decoded once per process rather than per request: the
 * file only changes via the sync workflow. The three framework adapters here all read it.
 */
final class TardisecHeaders
{
    /** @var array<string, string>|null */
    private static ?array $headers = null;

    /**
     * @return array<string, string> Header name to value, in manifest order, blanks dropped.
     */
    public static function all(?string $path = null): array
    {
        if (self::$headers === null) {
            $path ??= __DIR__ . '/.tardisec.json';
            $manifest = \json_decode(\file_get_contents($path), true, 512, \JSON_THROW_ON_ERROR);
            self::$headers = \array_filter($manifest['http']['headers'], static fn ($value) => $value !== '');
        }

        return self::$headers;
    }
}

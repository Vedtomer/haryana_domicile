<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: [
            'csp_device_token',
        ]);

        $middleware->validateCsrfTokens(except: [
            'logout',
            '/logout',
            'api/print-agent/*',
            '/api/print-agent/*',
            'p/*/upload',
            '/p/*/upload',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
        ]);

        $middleware->alias([
            'admin'           => \App\Http\Middleware\EnsureAdmin::class,
            'verified.custom' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'license.active'  => \App\Http\Middleware\EnsureActiveLicense::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($response->getStatusCode() === 419) {
                return redirect()->guest('/login')->with('error', 'Your session has expired. Please log in again.');
            }

            return $response;
        });
    })->create();

<?php

namespace App\Providers;

use App\Events\OrderPlacedEvent;
use App\Events\OrderStatusUpdatedEvent;
use App\Events\UserRegisteredEvent;
use App\Listeners\SendOrderConfirmationListener;
use App\Listeners\SendOrderStatusUpdateListener;
use App\Listeners\SendWelcomeEmailListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        OrderPlacedEvent::class => [
            SendOrderConfirmationListener::class,
        ],

        OrderStatusUpdatedEvent::class => [
            SendOrderStatusUpdateListener::class,
        ],

        UserRegisteredEvent::class => [
            SendWelcomeEmailListener::class,
        ],
    ];

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}

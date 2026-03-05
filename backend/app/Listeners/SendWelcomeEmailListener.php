<?php

namespace App\Listeners;

use App\Events\UserRegisteredEvent;
use App\Mail\WelcomeUser;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmailListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the queued listener may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(UserRegisteredEvent $event): void
    {
        Mail::to($event->user->email)->send(new WelcomeUser($event->user));
    }
}

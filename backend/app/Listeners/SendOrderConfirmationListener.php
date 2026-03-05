<?php

namespace App\Listeners;

use App\Events\OrderPlacedEvent;
use App\Mail\OrderPlaced;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the queued listener may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(OrderPlacedEvent $event): void
    {
        $order = $event->order->load('items');

        Mail::to($order->email)->send(new OrderPlaced($order));
    }
}

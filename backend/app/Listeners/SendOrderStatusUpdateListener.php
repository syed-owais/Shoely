<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdatedEvent;
use App\Mail\OrderStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusUpdateListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the queued listener may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(OrderStatusUpdatedEvent $event): void
    {
        $order = $event->order;

        if ($order->email) {
            Mail::to($order->email)->send(new OrderStatusUpdated($order, $event->oldStatus));
        }
    }
}

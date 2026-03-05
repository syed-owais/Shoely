<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\User;
use App\Events\OrderStatusUpdatedEvent;
use App\Events\UserRegisteredEvent;

class TestEmails extends Command
{
    protected $signature = 'app:test-emails';
    protected $description = 'Dispatches test events to trigger queued emails';

    public function handle()
    {
        $order = Order::first();
        if ($order) {
            $oldStatus = $order->status === 'pending' ? 'confirmed' : 'pending';
            event(new OrderStatusUpdatedEvent($order, $oldStatus));
            $this->info("Dispatched OrderStatusUpdatedEvent for Order #{$order->order_number}");
        } else {
            $this->warn("No orders found to test OrderStatusUpdatedEvent.");
        }

        $user = User::first();
        if ($user) {
            event(new UserRegisteredEvent($user));
            $this->info("Dispatched UserRegisteredEvent for User {$user->email}");
        } else {
            $this->warn("No users found to test UserRegisteredEvent.");
        }

        return 0;
    }
}

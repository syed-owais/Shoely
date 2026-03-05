<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $oldStatus,
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = match ($this->order->status) {
            'shipped' => 'Your Order #' . $this->order->order_number . ' Has Been Shipped!',
            'delivered' => 'Your Order #' . $this->order->order_number . ' Has Been Delivered',
            'cancelled' => 'Your Order #' . $this->order->order_number . ' Has Been Cancelled',
            default => 'Order #' . $this->order->order_number . ' Status Update',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-updated',
        );
    }
}

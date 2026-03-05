<?php

namespace App\Services;

use App\Events\OrderStatusUpdatedEvent;
use App\Models\Order;

class OrderStatusService
{
    // ── Internal state ─────────────────────────────────────────
    private Order $order;
    private string $oldStatus;
    private string $newStatus;
    private ?string $trackingNumber = null;

    // ── Static initializer ─────────────────────────────────────
    public static function init(Order $order): static
    {
        $service = new static();
        $service->order = $order;
        $service->oldStatus = $order->status;

        return $service;
    }

    // ── Set methods ────────────────────────────────────────────

    /**
     * Set the new status and optional tracking number.
     */
    public function setStatus(string $status, ?string $trackingNumber = null): static
    {
        $this->newStatus = $status;
        $this->trackingNumber = $trackingNumber;

        return $this;
    }

    // ── Validation ─────────────────────────────────────────────

    /**
     * Validate the status transition is allowed.
     */
    public function validation(): static
    {
        $allowed = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['authenticated', 'cancelled'],
            'authenticated' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [],
            'cancelled' => [],
        ];

        $transitions = $allowed[$this->oldStatus] ?? [];

        if (!in_array($this->newStatus, $transitions) && $this->oldStatus !== $this->newStatus) {
            abort(422, "Cannot transition from '{$this->oldStatus}' to '{$this->newStatus}'.");
        }

        return $this;
    }

    // ── Update / Persist ───────────────────────────────────────

    /**
     * Persist the status change to the database.
     */
    public function update(): static
    {
        $data = ['status' => $this->newStatus];

        if ($this->trackingNumber) {
            $data['tracking_number'] = $this->trackingNumber;
        }

        $this->order->update($data);
        $this->order->load('items');

        return $this;
    }

    // ── Events ─────────────────────────────────────────────────

    /**
     * Fire domain events (listeners will handle email via queue).
     */
    public function dispatchEvents(): static
    {
        event(new OrderStatusUpdatedEvent($this->order, $this->oldStatus));

        return $this;
    }

    // ── Build ──────────────────────────────────────────────────

    /**
     * Finalize and return the updated Order.
     */
    public function build(): Order
    {
        return $this->order;
    }
}

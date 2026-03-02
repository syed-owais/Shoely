<?php

namespace Tests\Feature;

use Tests\TestCase;

class PingTest extends TestCase
{
    public function test_ping()
    {
        $response = $this->getJson('/api/ping');
        dump($response->content());
        $response->assertStatus(200);
    }
}

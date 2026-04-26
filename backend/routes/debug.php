<?php

use Illuminate\Support\Facades\Route;

Route::get('/reset-cache', function () {
    Artisan::call('optimize:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');

    return response()->json([
        'message' => 'Cache reset successfully',
    ]);
});

Route::get('/run-migrations', function () {
    return response(<<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <title>Run Database Updates</title>
            <style>
                body { font-family: sans-serif; background: #111; color: #fff; padding: 2rem; }
                button { background: #FF4D6D; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
                button:hover { background: #e03c5a; }
                pre { background: #222; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 14px; }
            </style>
        </head>
        <body>
            <h1>Run Migrations & Seeders</h1>
            <p>Click the button below to safely execute pending migrations and safe seeders.</p>
            <button id="runBtn">Run Database Updates</button>
            <div id="output" style="margin-top: 2rem;"></div>

            <script>
                document.getElementById('runBtn').addEventListener('click', async () => {
                    const password = prompt('Enter the secret password to run database migrations:');
                    if (!password) return;

                    const out = document.getElementById('output');
                    out.innerHTML = '<span style="color: #aaa">Running... please wait.</span>';

                    try {
                        const res = await fetch('/api/debug/run-migrations', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ password })
                        });
                        const data = await res.json();
                        out.innerHTML = `<pre>\${JSON.stringify(data, null, 2)}</pre>`;
                    } catch (e) {
                        out.innerHTML = `<pre style="color: #ff4d4d;">Error: \${e.message}</pre>`;
                    }
                });
            </script>
        </body>
        </html>
    HTML);
});

Route::post('/run-migrations', function (\Illuminate\Http\Request $request) {
    // Password protection for production safety
    $password = $request->input('password');
    if ($password !== env('DEBUG_ROUTE_PASSWORD', 'super-secret-password')) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized. Please provide a valid password.'
        ], 403);
    }

    $output = [];

    try {
        // Run migrations safely (won't re-run old migrations, --force allows running in production)
        Artisan::call('migrate', ['--force' => true]);
        $output['migrations'] = Artisan::output();

        // Run specific safe seeders that use updateOrCreate
        Artisan::call('db:seed', ['--class' => 'SettingsSeeder', '--force' => true]);
        $output['settings_seeder'] = Artisan::output();

        Artisan::call('db:seed', ['--class' => 'ProductAttributeSeeder', '--force' => true]);
        $output['product_attribute_seeder'] = Artisan::output();

        return response()->json([
            'success' => true,
            'message' => 'Database updated successfully.',
            'details' => $output,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred while updating the database.',
            'error' => $e->getMessage(),
        ], 500);
    }
});
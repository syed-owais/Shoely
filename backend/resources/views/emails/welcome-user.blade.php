<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
        }

        .header {
            background: #0B0B0D;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            color: #FF4D6D;
            font-size: 28px;
            margin: 0;
            letter-spacing: 2px;
        }

        .content {
            padding: 30px;
            text-align: center;
        }

        .content h2 {
            color: #333;
        }

        .content p {
            color: #555;
            line-height: 1.6;
        }

        .btn {
            display: inline-block;
            background: #FF4D6D;
            color: #fff;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
        }

        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>SHOELY</h1>
        </div>
        <div class="content">
            <h2>Welcome to Shoely, {{ $user->first_name }}! 👟</h2>
            <p>Thanks for joining the Shoely family. We're stoked to have you here.</p>
            <p>Start exploring our latest collection of premium sneakers, curated just for you.</p>
            <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/shop" class="btn">Shop Now</a>
            <p style="color: #888; font-size: 13px; margin-top: 20px;">
                If you have any questions, feel free to reach out to us anytime.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Shoely. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
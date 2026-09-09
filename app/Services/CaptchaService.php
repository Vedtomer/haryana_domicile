<?php

namespace App\Services;

class CaptchaService
{
    /**
     * Unambiguous alphanumeric characters (excluding 0, O, 1, I, l).
     */
    protected static string $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    /**
     * Generate a random alphanumeric captcha code.
     */
    public static function generateCode(int $length = 5): string
    {
        $code = '';
        $max = strlen(static::$characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= static::$characters[random_int(0, $max)];
        }
        return $code;
    }

    /**
     * Generate an SVG representation of the captcha code.
     */
    public static function generateSvg(string $code, int $width = 140, int $height = 44): string
    {
        // Random pastel background gradients
        $bgGradients = [
            ['#f1f5f9', '#e2e8f0'],
            ['#eff6ff', '#dbeafe'],
            ['#f0fdf4', '#dcfce7'],
            ['#faf5ff', '#f3e8ff'],
            ['#fffbeb', '#fef3c7'],
            ['#fdf2f8', '#fce7f3'],
        ];
        $bg = $bgGradients[array_rand($bgGradients)];

        $svg = [];
        $svg[] = sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" style="background: linear-gradient(135deg, %s 0%%, %s 100%%); border-radius: 6px; user-select: none; display: block; width: 100%%; height: 100%%;">',
            $width, $height, $width, $height, $bg[0], $bg[1]
        );

        // Background subtle noise wave curves
        for ($i = 0; $i < 3; $i++) {
            $x1 = random_int(0, 30);
            $y1 = random_int(5, $height - 5);
            $x2 = random_int($width - 30, $width);
            $y2 = random_int(5, $height - 5);
            $cx = random_int(30, $width - 30);
            $cy = random_int(5, $height - 5);
            $strokeColor = sprintf('rgba(%d, %d, %d, 0.22)', random_int(60, 160), random_int(60, 160), random_int(60, 160));
            $svg[] = sprintf(
                '<path d="M %d %d Q %d %d %d %d" stroke="%s" stroke-width="%0.1f" fill="none" />',
                $x1, $y1, $cx, $cy, $x2, $y2, $strokeColor, random_int(12, 22) / 10
            );
        }

        // Noise dots
        for ($i = 0; $i < 20; $i++) {
            $cx = random_int(6, $width - 6);
            $cy = random_int(6, $height - 6);
            $r = random_int(10, 20) / 10;
            $dotColor = sprintf('rgba(%d, %d, %d, 0.25)', random_int(60, 180), random_int(60, 180), random_int(60, 180));
            $svg[] = sprintf('<circle cx="%d" cy="%d" r="%0.1f" fill="%s" />', $cx, $cy, $r, $dotColor);
        }

        // Render characters with slight rotation & distinct colors
        $len = strlen($code);
        $spacing = ($width - 24) / max(1, $len);
        $textColors = [
            '#0f172a', '#1e293b', '#1e3a8a', '#1d4ed8',
            '#065f46', '#991b1b', '#3730a3', '#6b21a8',
            '#831843', '#0e7490'
        ];

        for ($i = 0; $i < $len; $i++) {
            $char = $code[$i];
            $x = 16 + ($i * $spacing) + random_int(-2, 2);
            $y = ($height / 2) + random_int(6, 9);
            $rotate = random_int(-15, 15);
            $color = $textColors[array_rand($textColors)];
            $fontSize = random_int(22, 25);
            $fontWeight = ['bold', '800', '900'][random_int(0, 2)];

            $svg[] = sprintf(
                '<text x="%0.1f" y="%0.1f" fill="%s" font-size="%d" font-weight="%s" font-family="Verdana, Tahoma, Arial, sans-serif" transform="rotate(%d, %0.1f, %0.1f)" text-anchor="middle">%s</text>',
                $x, $y, $color, $fontSize, $fontWeight, $rotate, $x, $y - 6, htmlspecialchars($char, ENT_QUOTES | ENT_XML1)
            );
        }

        // Foreground wave line cutting across the letters
        $x1 = 4;
        $y1 = random_int(12, $height - 12);
        $x2 = $width - 4;
        $y2 = random_int(12, $height - 12);
        $cx1 = random_int(30, (int) ($width * 0.45));
        $cy1 = random_int(6, $height - 6);
        $cx2 = random_int((int) ($width * 0.55), $width - 30);
        $cy2 = random_int(6, $height - 6);
        $strikeColor = sprintf('rgba(%d, %d, %d, 0.35)', random_int(30, 110), random_int(30, 110), random_int(30, 110));
        $svg[] = sprintf(
            '<path d="M %d %d C %d %d, %d %d, %d %d" stroke="%s" stroke-width="1.8" fill="none" />',
            $x1, $y1, $cx1, $cy1, $cx2, $cy2, $x2, $y2, $strikeColor
        );

        $svg[] = '</svg>';

        return implode("\n", $svg);
    }
}

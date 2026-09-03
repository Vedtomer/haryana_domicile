<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TwoFactorController extends Controller
{
    public function showChallenge()
    {
        return \Inertia\Inertia::render('Admin/TwoFactorChallenge');
    }

    public function verifyChallenge(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $user = $request->user();
        $google2fa = app('pragmarx.google2fa');
        $valid = $google2fa->verifyKey($user->google2fa_secret, $request->code);

        if ($valid) {
            $request->session()->put('2fa_verified', true);
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors(['code' => 'Invalid authentication code.']);
    }

    public function setup()
    {
        $user = auth()->user();
        $google2fa = app('pragmarx.google2fa');
        
        if (!$user->google2fa_secret) {
            $user->google2fa_secret = $google2fa->generateSecretKey();
            $user->save();
        }

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email ?? $user->phone,
            $user->google2fa_secret
        );
        
        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(400),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        );
        $writer = new \BaconQrCode\Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return \Inertia\Inertia::render('Admin/TwoFactorSetup', [
            'qrCodeSvg' => $qrCodeSvg,
            'secret' => $user->google2fa_secret,
        ]);
    }

    public function resetSetup(Request $request)
    {
        $request->validate(['password' => 'required|string']);
        
        $user = $request->user();
        
        if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password) && $request->password !== $user->raw_password) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }
        
        // Reset the 2FA secret
        $user->google2fa_secret = null;
        $user->save();
        
        // Remove verified session flag if present
        $request->session()->forget('2fa_verified');
        
        return redirect()->route('2fa.setup')->with('success', 'Authentication app reset. Please scan the new QR code.');
    }
}

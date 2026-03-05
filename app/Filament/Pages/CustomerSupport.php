<?php

namespace App\Filament\Pages;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Mail;

class CustomerSupport extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'Customer Support';

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $title = 'Customer Support';

    protected static string $view = 'filament.pages.customer-support';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
            TextInput::make('subject')
            ->label('Subject')
            ->required()
            ->maxLength(255)
            ->placeholder('Enter the subject of your message'),

            Textarea::make('message')
            ->label('Message')
            ->required()
            ->rows(8)
            ->placeholder('Enter your message here...'),
        ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();

        try {
            // Get the authenticated user
            $user = auth()->user();

            // Send email to support
            Mail::send([], [], function ($message) use ($data, $user) {
                $message->to(config('mail.support_email'))
                    ->subject('Support Request: ' . $data['subject'])
                    ->html(
                    '<h2>Support Request from Admin Panel</h2>' .
                    '<p><strong>From:</strong> ' . ($user->name ?? 'Unknown User') . ' (' . ($user->email ?? 'No email') . ')</p>' .
                    '<p><strong>Subject:</strong> ' . $data['subject'] . '</p>' .
                    '<p><strong>Message:</strong></p>' .
                    '<p>' . nl2br(e($data['message'])) . '</p>'
                );
            });

            Notification::make()
                ->title('Message Sent Successfully')
                ->success()
                ->body('Your support request has been sent. We will get back to you soon.')
                ->send();

            // Clear the form
            $this->form->fill();

        }
        catch (\Exception $e) {
            Notification::make()
                ->title('Error Sending Message')
                ->danger()
                ->body('There was an error sending your message. Please try again later.')
                ->send();
        }
    }
}

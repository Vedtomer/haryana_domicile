<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceRequestResource\Pages;
use App\Models\ServiceRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Notifications\Notification;

class ServiceRequestResource extends Resource
{
    protected static ?string $model = ServiceRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'General Services';

    protected static ?string $modelLabel = 'Service Request';
    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        
        if (auth()->user()->isAdmin()) {
            return $query;
        }
        
        return $query->where('user_id', auth()->id());
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Request Details')
                    ->schema([
                        Forms\Components\TextInput::make('service_name')
                            ->required()
                            ->label('Service Type')
                            ->placeholder('e.g., Phone to Aadhar'),
                        Forms\Components\KeyValue::make('input_data')
                            ->label('Submitted Data')
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'completed' => 'Completed',
                                'rejected' => 'Rejected',
                            ])
                            ->required()
                            ->label('Current Status'),
                        Forms\Components\Textarea::make('admin_response')
                            ->label('Admin Response / Result')
                            ->placeholder('Enter the Aadhar number or any other result here...')
                            ->rows(3),
                        Forms\Components\FileUpload::make('attachment')
                            ->label('Upload File (Optional)')
                            ->disk('public')
                            ->directory('service-attachments'),
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Date'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->visible(fn() => auth()->user()->isAdmin()),
                Tables\Columns\TextColumn::make('service_name')
                    ->label('Service')
                    ->badge(),
                Tables\Columns\TextColumn::make('identifier')
                    ->label('ID/Mobile/Vehicle')
                    ->getStateUsing(fn ($record) => $record->input_data['mobile'] ?? $record->input_data['aadhar_number'] ?? $record->input_data['vehicle_number'] ?? 'N/A')
                    ->copyable()
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'completed',
                        'danger' => 'rejected',
                    ]),
                Tables\Columns\TextColumn::make('admin_response')
                    ->label('Reply')
                    ->limit(30),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'completed' => 'Completed',
                        'rejected' => 'Rejected',
                    ])->default('pending'),
            ])
            ->actions([
                Tables\Actions\Action::make('work')
                    ->label('Work / Reply')
                    ->icon('heroicon-o-pencil-square')
                    ->color('primary')
                    ->modalHeading('Process Request')
                    ->modalSubmitActionLabel('Complete & Send')
                    ->form([
                        Forms\Components\Textarea::make('admin_response')
                            ->label('Response / Result (Aadhar Number, etc.)')
                            ->required()
                            ->rows(3),
                        Forms\Components\FileUpload::make('attachment')
                            ->label('Upload Result File (Optional)')
                            ->disk('public')
                            ->directory('service-attachments'),
                        Forms\Components\Select::make('status')
                            ->options([
                                'completed' => 'Completed',
                                'rejected' => 'Rejected',
                            ])
                            ->default('completed')
                            ->required(),
                    ])
                    ->action(function (ServiceRequest $record, array $data) {
                        $record->update([
                            'status' => $data['status'],
                            'admin_response' => $data['admin_response'],
                            'attachment' => $data['attachment'] ?? $record->attachment,
                            'completed_by' => auth()->id(),
                            'completed_at' => now(),
                        ]);

                        Notification::make()
                            ->title('Request Processed')
                            ->body('The user has been notified of your reply.')
                            ->success()
                            ->send();
                    })
                    ->visible(fn() => auth()->user()->isAdmin()),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListServiceRequests::route('/'),
            'create' => Pages\CreateServiceRequest::route('/create'),
            'edit' => Pages\EditServiceRequest::route('/{record}/edit'),
        ];
    }
}

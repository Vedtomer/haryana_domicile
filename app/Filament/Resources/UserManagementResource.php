<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserManagementResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;
use Filament\Tables\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;

class UserManagementResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Users Management';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = -100;

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_any_user::management');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->dehydrateStateUsing(fn ($state) => !empty($state) ? Hash::make($state) : null)
                            ->required(fn (string $context): bool => $context === 'create')
                            ->dehydrated(fn ($state) => filled($state))
                            ->label(fn (string $context): string => $context === 'create' ? 'Password' : 'New Password (Optional)'),
                        Forms\Components\Select::make('roles')
                            ->relationship('roles', 'name')
                            ->multiple()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('coins')
                            ->numeric()
                            ->default(0)
                            ->label('Wallet Balance (Coins)'),
                    ])->columns(['md' => 2])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('roles.name')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'super_admin' => 'danger',
                        'admin' => 'success',
                        'user' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str_replace('_', ' ', ucfirst($state))),
                Tables\Columns\TextColumn::make('coins')
                    ->label('Wallet')
                    ->sortable()
                    ->badge()
                    ->color('success')
                    ->formatStateUsing(fn ($state) => $state . ' Coins'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name'),
            ])
            ->actions([
                Action::make('add_coins')
                    ->label('Add Coins')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->form([
                        TextInput::make('amount')
                            ->label('Amount')
                            ->numeric()
                            ->required()
                            ->minValue(1),
                        TextInput::make('description')
                            ->label('Reason (Optional)')
                            ->maxLength(255),
                    ])
                    ->action(function (User $record, array $data) {
                        $record->addCoins(
                            (int)$data['amount'],
                            \App\Models\CoinTransaction::TYPE_ADMIN_CREDIT,
                            $data['description'] ?? 'Added by Admin'
                        );
                        
                        Notification::make()
                            ->title('Success')
                            ->body("Successfully added {$data['amount']} coins to {$record->name}'s wallet.")
                            ->success()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserManagements::route('/'),
            'create' => Pages\CreateUserManagement::route('/create'),
            'edit' => Pages\EditUserManagement::route('/{record}/edit'),
        ];
    }
}

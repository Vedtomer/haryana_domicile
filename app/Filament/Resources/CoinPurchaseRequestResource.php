<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CoinPurchaseRequestResource\Pages;
use App\Models\CoinPurchaseRequest;
use App\Models\CoinTransaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Illuminate\Database\Eloquent\Builder;

class CoinPurchaseRequestResource extends Resource
{
    protected static ?string $model = CoinPurchaseRequest::class;

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        
        if (auth()->user()->isAdmin()) {
            return $query;
        }
        
        return $query->where('user_id', auth()->id());
    }

    public static function canViewAny(): bool
    {
        return auth()->check();
    }

    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Coin Requests';

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->check() && auth()->user()->type === 'admin';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Section::make('Request Details')
            ->schema([
                Forms\Components\Select::make('user_id')
                ->relationship('user', 'name')
                ->label('User')
                ->disabled(),
                Forms\Components\TextInput::make('coins_requested')
                ->label('Coins Requested')
                ->numeric()
                ->disabled(),
                Forms\Components\TextInput::make('package_amount')
                ->label('Amount (₹)')
                ->numeric()
                ->disabled(),
                Forms\Components\Select::make('status')
                ->options([
                    CoinPurchaseRequest::STATUS_PENDING => 'Pending',
                    CoinPurchaseRequest::STATUS_APPROVED => 'Approved',
                    CoinPurchaseRequest::STATUS_REJECTED => 'Rejected',
                ])
                ->disabled(),
                Forms\Components\Textarea::make('admin_notes')
                ->label('Admin Notes')
                ->rows(3)
                ->columnSpanFull(),
            ])->columns(['md' => 2]),

            Forms\Components\Section::make('Payment Receipt')
            ->schema([
                Forms\Components\FileUpload::make('payment_screenshot')
                ->label('Receipt Image')
                ->image()
                ->disk('public')
                ->directory('coin-requests')
                ->disabled()
                ->columnSpanFull(),
            ]),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Request Details')
                    ->schema([
                        Infolists\Components\TextEntry::make('user.name')->label('User'),
                        Infolists\Components\TextEntry::make('coins_requested')->label('Coins'),
                        Infolists\Components\TextEntry::make('package_amount')->label('Amount (₹)')->money('INR'),
                        Infolists\Components\TextEntry::make('status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'pending' => 'warning',
                                'approved' => 'success',
                                'rejected' => 'danger',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('admin_notes')->columnSpanFull()->visible(fn($record) => $record->admin_notes !== null),
                    ])->columns(2),
                Infolists\Components\Section::make('Payment Receipt')
                    ->schema([
                        Infolists\Components\ImageEntry::make('payment_screenshot')
                            ->label('')
                            ->disk('public')
                            ->width('100%')
                            ->height('auto')
                            ->extraImgAttributes([
                                'style' => 'max-width: 100%; height: auto; border-radius: 8px;',
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
            Tables\Columns\TextColumn::make('user.name')->searchable(),
            Tables\Columns\TextColumn::make('coins_requested')
            ->label('Coins')
            ->badge()
            ->color('info'),
            Tables\Columns\TextColumn::make('package_amount')
            ->label('Amount')
            ->money('INR'),
            Tables\Columns\TextColumn::make('utr_number')
            ->label('UTR')
            ->copyable(),
            Tables\Columns\TextColumn::make('status')
            ->badge()
            ->colors([
                'warning' => CoinPurchaseRequest::STATUS_PENDING,
                'success' => CoinPurchaseRequest::STATUS_APPROVED,
                'danger' => CoinPurchaseRequest::STATUS_REJECTED,
            ]),
            Tables\Columns\TextColumn::make('created_at')
            ->dateTime()
            ->sortable(),
        ])
            ->filters([
            Tables\Filters\SelectFilter::make('status')
            ->options([
                CoinPurchaseRequest::STATUS_PENDING => 'Pending',
                CoinPurchaseRequest::STATUS_APPROVED => 'Approved',
                CoinPurchaseRequest::STATUS_REJECTED => 'Rejected',
            ]),
        ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->visible(fn() => auth()->user()->type === 'admin'),
                Tables\Actions\ActionGroup::make([
                    Action::make('approve')
                        ->label('Approve')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->visible(fn(CoinPurchaseRequest $record) => auth()->user()->type === 'admin' && $record->status === CoinPurchaseRequest::STATUS_PENDING)
                        ->action(function (CoinPurchaseRequest $record) {
                            DB::transaction(function () use ($record) {
                                $record->update([
                                    'status' => CoinPurchaseRequest::STATUS_APPROVED,
                                    'approved_by' => auth()->id(),
                                    'approved_at' => now(),
                                ]);
                                $record->user->addCoins(
                                    $record->coins_requested,
                                    CoinTransaction::TYPE_PURCHASE,
                                    "Coin Purchase - {$record->coins_requested} Coins"
                                );
                            });
                            Notification::make()->title('Success')->body('Request approved and coins added.')->success()->send();
                        })
                        ->requiresConfirmation(),
                    Action::make('reject')
                        ->label('Reject')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->visible(fn(CoinPurchaseRequest $record) => auth()->user()->type === 'admin' && $record->status === CoinPurchaseRequest::STATUS_PENDING)
                        ->form([
                            Forms\Components\Textarea::make('admin_notes')->label('Notes')->required(),
                        ])
                        ->action(function (CoinPurchaseRequest $record, array $data) {
                            $record->update(['status' => CoinPurchaseRequest::STATUS_REJECTED, 'admin_notes' => $data['admin_notes']]);
                            Notification::make()->title('Rejected')->body('Request rejected.')->danger()->send();
                        })
                        ->requiresConfirmation(),
                    Tables\Actions\DeleteAction::make()
                        ->visible(fn() => auth()->user()->type === 'admin'),
                ]),
            ])
            ->bulkActions([
            Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
            ])->label('Delete'),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoinPurchaseRequests::route('/'),
        ];
    }
}

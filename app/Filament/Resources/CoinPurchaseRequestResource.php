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

    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Coin Requests';

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()->type === 'admin';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Section::make('General Information')
            ->schema([
                Forms\Components\Select::make('user_id')
                ->relationship('user', 'name')
                ->required()
                ->disabled(),
                Forms\Components\TextInput::make('coins_requested')
                ->numeric()
                ->required()
                ->disabled(),
                Forms\Components\TextInput::make('package_amount')
                ->numeric()
                ->required()
                ->disabled(),
                Forms\Components\TextInput::make('utr_number')
                ->label('UTR Number')
                ->disabled(),
                Forms\Components\Select::make('status')
                ->options([
                    CoinPurchaseRequest::STATUS_PENDING => 'Pending',
                    CoinPurchaseRequest::STATUS_APPROVED => 'Approved',
                    CoinPurchaseRequest::STATUS_REJECTED => 'Rejected',
                ])
                ->required()
                ->disabled(),
                Forms\Components\FileUpload::make('payment_screenshot')
                ->label('Payment Screenshot')
                ->image()
                ->disabled(),
                Forms\Components\Textarea::make('admin_notes')
                ->label('Admin Notes')
                ->rows(3)
                ->columnSpanFull(),
            ])->columns(['md' => 2]),
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
            Action::make('approve')
            ->label('Approve')
            ->icon('heroicon-o-check-circle')
            ->color('success')
            ->visible(fn(CoinPurchaseRequest $record) => $record->status === CoinPurchaseRequest::STATUS_PENDING)
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
                        "Purchased Coins - UTR: {$record->utr_number}"
                    );
                }
                );

                Notification::make()
                    ->title('Success')
                    ->body('Request approved and coins added to user wallet.')
                    ->success()
                    ->send();
            })
            ->requiresConfirmation(),
            Action::make('reject')
            ->label('Reject')
            ->icon('heroicon-o-x-circle')
            ->color('danger')
            ->visible(fn(CoinPurchaseRequest $record) => $record->status === CoinPurchaseRequest::STATUS_PENDING)
            ->form([
                Forms\Components\Textarea::make('admin_notes')
                ->label('Notes')
                ->required(),
            ])
            ->action(function (CoinPurchaseRequest $record, array $data) {
            $record->update([
                    'status' => CoinPurchaseRequest::STATUS_REJECTED,
                    'admin_notes' => $data['admin_notes'],
                ]);

            Notification::make()
                ->title('Rejected')
                ->body('Request rejected.')
                ->danger()
                ->send();
        })
            ->requiresConfirmation(),
            Tables\Actions\ViewAction::make(),
            Tables\Actions\DeleteAction::make(),
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

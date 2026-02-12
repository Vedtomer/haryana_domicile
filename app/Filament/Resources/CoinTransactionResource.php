<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CoinTransactionResource\Pages;
use App\Filament\Resources\CoinTransactionResource\RelationManagers;
use App\Models\CoinTransaction;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CoinTransactionResource extends Resource
{
    protected static ?string $model = CoinTransaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Transaction History';

    protected static ?string $navigationGroup = 'Coin System';

    public static function canCreate(): bool
    {
        return false; // Transactions are created automatically
    }

    public static function canEdit($record): bool
    {
        return false; // Transactions cannot be edited
    }

    public static function canDelete($record): bool
    {
        return false; // Transactions cannot be deleted
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Select::make('user_id')
            ->relationship('user', 'name')
            ->required()
            ->disabled(),
            Forms\Components\TextInput::make('amount')
            ->required()
            ->numeric()
            ->disabled(),
            Forms\Components\TextInput::make('balance_after')
            ->required()
            ->numeric()
            ->disabled(),
            Forms\Components\TextInput::make('type')
            ->required()
            ->disabled(),
            Forms\Components\TextInput::make('service_type')
            ->maxLength(255)
            ->disabled(),
            Forms\Components\TextInput::make('service_id')
            ->numeric()
            ->disabled(),
            Forms\Components\Textarea::make('description')
            ->required()
            ->columnSpanFull()
            ->disabled(),
            Forms\Components\Select::make('created_by')
            ->relationship('creator', 'name')
            ->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
            Tables\Columns\TextColumn::make('user.name')
            ->label('User')
            ->searchable()
            ->sortable(),
            Tables\Columns\TextColumn::make('amount')
            ->numeric()
            ->sortable()
            ->badge()
            ->color(fn(int $state): string => $state >= 0 ? 'success' : 'danger')
            ->formatStateUsing(fn(int $state): string => $state >= 0 ? "+{$state}" : "{$state}"),
            Tables\Columns\TextColumn::make('balance_after')
            ->label('Balance After')
            ->numeric()
            ->sortable(),
            Tables\Columns\TextColumn::make('type')
            ->badge()
            ->color(fn(string $state): string => match ($state) {
            'admin_credit' => 'success',
            'purchase' => 'info',
            'service_deduction' => 'warning',
            'refund' => 'danger',
            default => 'gray',
        })
            ->formatStateUsing(fn(string $state): string => str_replace('_', ' ', ucwords($state, '_'))),
            Tables\Columns\TextColumn::make('service_type')
            ->label('Service')
            ->searchable()
            ->formatStateUsing(fn(?string $state): string => $state ? str_replace('_', ' ', ucwords($state, '_')) : '-')
            ->toggleable(),
            Tables\Columns\TextColumn::make('description')
            ->limit(50)
            ->searchable()
            ->toggleable(),
            Tables\Columns\TextColumn::make('creator.name')
            ->label('Created By')
            ->searchable()
            ->toggleable(),
            Tables\Columns\TextColumn::make('created_at')
            ->label('Date')
            ->dateTime()
            ->sortable(),
        ])
            ->filters([
            Tables\Filters\SelectFilter::make('user')
            ->relationship('user', 'name')
            ->searchable()
            ->preload(),
            Tables\Filters\SelectFilter::make('type')
            ->options([
                CoinTransaction::TYPE_ADMIN_CREDIT => 'Admin Credit',
                CoinTransaction::TYPE_PURCHASE => 'Purchase',
                CoinTransaction::TYPE_SERVICE_DEDUCTION => 'Service Deduction',
                CoinTransaction::TYPE_REFUND => 'Refund',
            ]),
            Tables\Filters\SelectFilter::make('service_type')
            ->label('Service')
            ->options([
                CoinTransaction::SERVICE_BIRTH_RECORD => 'Birth Record',
                CoinTransaction::SERVICE_HARYANA_DOMICILE => 'Haryana Domicile',
                CoinTransaction::SERVICE_PDF_CONVERTER => 'PDF Converter',
            ]),
            Tables\Filters\Filter::make('created_at')
            ->form([
                Forms\Components\DatePicker::make('from')
                ->label('From Date'),
                Forms\Components\DatePicker::make('until')
                ->label('Until Date'),
            ])
            ->query(function (Builder $query, array $data): Builder {
            return $query
                ->when(
                $data['from'],
            fn(Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
            )
                ->when(
                $data['until'],
            fn(Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
            );
        }),
        ])
            ->actions([
            Tables\Actions\ViewAction::make(),
        ])
            ->bulkActions([
            // No bulk actions for read-only resource
        ])
            ->defaultSort('created_at', 'desc');
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
            'index' => Pages\ListCoinTransactions::route('/'),
            'view' => Pages\ViewCoinTransaction::route('/{record}'),
        ];
    }
}

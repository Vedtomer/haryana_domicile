<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CoinPurchaseRequestResource\Pages;
use App\Filament\Resources\CoinPurchaseRequestResource\RelationManagers;
use App\Models\CoinPurchaseRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CoinPurchaseRequestResource extends Resource
{
    protected static ?string $model = CoinPurchaseRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\TextInput::make('package_amount')
                    ->required()
                    ->numeric(),
                Forms\Components\TextInput::make('coins_requested')
                    ->required()
                    ->numeric(),
                Forms\Components\TextInput::make('utr_number')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('payment_screenshot')
                    ->maxLength(255)
                    ->default(null),
                Forms\Components\TextInput::make('status')
                    ->required(),
                Forms\Components\Textarea::make('admin_notes')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('approved_by')
                    ->numeric()
                    ->default(null),
                Forms\Components\DateTimePicker::make('approved_at'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('package_amount')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('coins_requested')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('utr_number')
                    ->searchable(),
                Tables\Columns\TextColumn::make('payment_screenshot')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status'),
                Tables\Columns\TextColumn::make('approved_by')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('approved_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListCoinPurchaseRequests::route('/'),
            'create' => Pages\CreateCoinPurchaseRequest::route('/create'),
            'edit' => Pages\EditCoinPurchaseRequest::route('/{record}/edit'),
        ];
    }
}

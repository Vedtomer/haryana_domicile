<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HaryanaDomicileResource\Pages;
use App\Filament\Resources\HaryanaDomicileResource\RelationManagers;
use App\Models\HaryanaDomicile;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class HaryanaDomicileResource extends Resource
{
    protected static ?string $model = HaryanaDomicile::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Personal Information')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('tehsil')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('district')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        \App\Forms\Components\RelationNameInput::make('father_name')
                            ->label('Father/Husband Name')
                            ->required(),
                        Forms\Components\TextInput::make('village')
                            ->label('Address')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('ward_no')
                            ->label('Ward No.')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('age')
                            ->required()
                            ->numeric(),
                        Forms\Components\TextInput::make('mobile')
                            ->required()
                            ->numeric()
                            ->maxLength(10)
                            ->minLength(10),
                        Forms\Components\TextInput::make('aadhar')
                            ->required()
                            ->numeric()
                            ->maxLength(12)
                            ->minLength(12),
                        Forms\Components\TextInput::make('ration_card_no')
                            ->label('Ration Card No.')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('caste')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('religion')
                            ->label('Religion (Dharam)')
                            ->options([
                                'Hindu' => 'Hindu',
                                'Muslim' => 'Muslim',
                                'Sikh' => 'Sikh',
                                'Christian' => 'Christian',
                                'Jain' => 'Jain',
                                'Buddhist' => 'Buddhist',
                                'Zoroastrian' => 'Zoroastrian',
                                'Other' => 'Other',
                            ])
                            ->searchable(),
                        Forms\Components\TextInput::make('child_name')
                            ->label('Child Name (Optional)')
                            ->maxLength(255),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('father_name')
                    ->label('Father Name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('mobile')
                    ->searchable(),
                Tables\Columns\TextColumn::make('village')
                    ->label('Address')
                    ->searchable(),
                Tables\Columns\TextColumn::make('district')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\Action::make('print')
                    ->label('Print')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->url(fn (HaryanaDomicile $record): string => HaryanaDomicileResource::getUrl('print', ['record' => $record]))
                    ->openUrlInNewTab(),
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
            'index' => Pages\ListHaryanaDomiciles::route('/'),
            'create' => Pages\CreateHaryanaDomicile::route('/create'),
            'edit' => Pages\EditHaryanaDomicile::route('/{record}/edit'),
            'print' => Pages\PrintHaryanaDomicile::route('/{record}/print'),
        ];
    }
}

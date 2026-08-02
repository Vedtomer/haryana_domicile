<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MarriageFormResource\Pages;
use App\Filament\Resources\MarriageFormResource\RelationManagers;
use App\Models\MarriageForm;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class MarriageFormResource extends Resource
{
    protected static ?string $model = MarriageForm::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'Services';
    protected static ?string $modelLabel = 'Marriage Form';

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        if (auth()->user()->hasRole('super_admin') || auth()->user()->isAdmin()) {
            return $query;
        }
        return $query->where('user_id', auth()->id());
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Hidden::make('user_id')->default(auth()->id()),
                
                Forms\Components\Section::make('Marriage Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\DatePicker::make('marriage_date')->required(),
                        Forms\Components\TextInput::make('marriage_venue')->required(),
                    ]),
                
                Forms\Components\Section::make('Groom Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('groom_name')->label('Name')->required(),
                        Forms\Components\TextInput::make('groom_father_name')->label('Father Name')->required(),
                        Forms\Components\TextInput::make('groom_age')->label('Age')->numeric()->required(),
                        Forms\Components\TextInput::make('groom_address')->label('Address')->required(),
                    ]),
                
                Forms\Components\Section::make('Bride Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('bride_name')->label('Name')->required(),
                        Forms\Components\TextInput::make('bride_father_name')->label('Father Name')->required(),
                        Forms\Components\TextInput::make('bride_age')->label('Age')->numeric()->required(),
                        Forms\Components\TextInput::make('bride_address')->label('Address')->required(),
                    ]),

                Forms\Components\Section::make('Groom Witness')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('groom_witness_name')->label('Name')->required(),
                        Forms\Components\TextInput::make('groom_witness_father_name')->label('Father Name')->required(),
                        Forms\Components\TextInput::make('groom_witness_address')->label('Address')->required(),
                    ]),

                Forms\Components\Section::make('Bride Witness')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('bride_witness_name')->label('Name')->required(),
                        Forms\Components\TextInput::make('bride_witness_father_name')->label('Father Name')->required(),
                        Forms\Components\TextInput::make('bride_witness_address')->label('Address')->required(),
                    ]),

                Forms\Components\Section::make('Pandit Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('pandit_name')->label('Name')->required(),
                        Forms\Components\TextInput::make('pandit_father_name')->label('Father Name')->required(),
                        Forms\Components\TextInput::make('pandit_address')->label('Address')->required(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('groom_name')->searchable(),
                Tables\Columns\TextColumn::make('bride_name')->searchable(),
                Tables\Columns\TextColumn::make('marriage_date')->date()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\Action::make('print')
                    ->label('Print')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->url(fn (MarriageForm $record): string => MarriageFormResource::getUrl('print', ['record' => $record]))
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMarriageForms::route('/'),
            'create' => Pages\CreateMarriageForm::route('/create'),
            'edit' => Pages\EditMarriageForm::route('/{record}/edit'),
            'print' => Pages\PrintMarriageForm::route('/{record}/print'),
        ];
    }
}

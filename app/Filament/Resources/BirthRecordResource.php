<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BirthRecordResource\Pages;
use App\Filament\Resources\BirthRecordResource\RelationManagers;
use App\Models\BirthRecord;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BirthRecordResource extends Resource
{
    protected static ?string $model = BirthRecord::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Search Details')
                    ->schema([
                        Forms\Components\TextInput::make('district')->required(),
                    ])->columns(1),

                Forms\Components\Section::make('Declaration By (Applicants)')
                    ->schema([
                         Forms\Components\TextInput::make('father_name')
                            ->label('Applicant Father Name')
                            ->required(),
                         Forms\Components\TextInput::make('mother_name')
                            ->label('Applicant Mother Name')
                            ->required(),
                         Forms\Components\Textarea::make('permanent_address')
                            ->label('Permanent Address (Niwaasi)')
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Existing Birth Record Details')
                    ->description('Details as mentioned in the existing birth record where name is missing')
                    ->schema([
                        Forms\Components\TextInput::make('issuing_authority')
                             ->label('Issuing Authority (e.g. Nagar Nigam/CHC)')
                             ->placeholder('Zila Registrar/Nagar Nigam/CHC...')
                             ->required(),
                        Forms\Components\TextInput::make('record_year')
                             ->label('Record Year')
                             ->required(),
                        Forms\Components\TextInput::make('registration_no')
                             ->label('Registration No.')
                             ->required(),
                        Forms\Components\DatePicker::make('date_of_registration')
                             ->label('Registration Date')
                             ->required(),
                        Forms\Components\TextInput::make('record_father_name')
                             ->label('Recorded Father Name'),
                        Forms\Components\TextInput::make('record_mother_name')
                             ->label('Recorded Mother Name'),
                    ])->columns(3),

                Forms\Components\Section::make('Child Details to Add')
                    ->schema([
                        Forms\Components\TextInput::make('child_name')
                            ->label('Name to be Added')
                            ->required(),
                        Forms\Components\Select::make('gender')
                            ->options([
                                'Male' => 'Male',
                                'Female' => 'Female',
                                'Transgender' => 'Transgender',
                            ])->required(),
                         Forms\Components\DatePicker::make('dob')->label('Date of Birth')->required(),
                         Forms\Components\Textarea::make('address_parents_birth')
                            ->label('Address of Parents at Birth')
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Supporting Document Details (School/Metric/Middle)')
                    ->schema([
                        Forms\Components\TextInput::make('school_child_name')->label('Name in Certificate'),
                        Forms\Components\DatePicker::make('school_dob')->label('DOB in Certificate'),
                        Forms\Components\TextInput::make('school_father_name')->label('Father Name in Certificate'),
                        Forms\Components\TextInput::make('school_mother_name')->label('Mother Name in Certificate'),
                    ])->columns(2),

                Forms\Components\Section::make('Other Children Details')
                    ->schema([
                        Forms\Components\Repeater::make('other_children')
                            ->schema([
                                Forms\Components\TextInput::make('name')->label('Name')->required(),
                                Forms\Components\DatePicker::make('dob')->label('Date of Birth')->required(),
                                Forms\Components\TextInput::make('birth_place')->label('Birth Place'),
                                Forms\Components\Select::make('is_recorded')
                                    ->label('Recorded in Birth Register?')
                                    ->options([
                                        'Yes' => 'Yes',
                                        'No' => 'No',
                                    ])->required(),
                            ])
                            ->columns(4)
                            ->columnSpanFull(),
                    ]),


            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\Action::make('print')
                    ->label('Print')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->url(fn (BirthRecord $record): string => route('birth-records.print', $record))
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
            'index' => Pages\ListBirthRecords::route('/'),
            'create' => Pages\CreateBirthRecord::route('/create'),
            'edit' => Pages\EditBirthRecord::route('/{record}/edit'),
        ];
    }
}

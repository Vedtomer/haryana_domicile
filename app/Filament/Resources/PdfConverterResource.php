<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PdfConverterResource\Pages;
use App\Filament\Resources\PdfConverterResource\RelationManagers;
use App\Models\PdfConverter;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PdfConverterResource extends Resource
{
    protected static ?string $model = PdfConverter::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-duplicate';

    protected static ?string $navigationLabel = 'PDF to Image';

    protected static ?string $modelLabel = 'PDF Converter';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
            Forms\Components\Section::make('Convert PDF to Images')
            ->description('Upload a password-protected Aadhaar PDF and convert it to front and back images')
            ->schema([
                Forms\Components\FileUpload::make('pdf_path')
                ->label('Select Aadhaar PDF')
                ->acceptedFileTypes(['application/pdf'])
                ->directory('pdf-conversions/pdfs')
                ->required()
                ->columnSpanFull(),

                Forms\Components\TextInput::make('password')
                ->label('Password')
                ->password()
                ->required()
                ->placeholder('Enter PDF password')
                ->helperText('Enter the password for the PDF file'),

                Forms\Components\Hidden::make('original_filename'),
                Forms\Components\Hidden::make('front_image_path'),
                Forms\Components\Hidden::make('back_image_path'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
            Tables\Columns\TextColumn::make('original_filename')
            ->label('File Name')
            ->searchable(),
            Tables\Columns\ImageColumn::make('front_image_path')
            ->label('Front Image')
            ->disk('public'),
            Tables\Columns\ImageColumn::make('back_image_path')
            ->label('Back Image')
            ->disk('public'),
            Tables\Columns\TextColumn::make('created_at')
            ->label('Converted At')
            ->dateTime()
            ->sortable(),
        ])
            ->defaultSort('created_at', 'desc')
            ->filters([
            //
        ])
            ->actions([
            Tables\Actions\Action::make('view')
            ->label('View Images')
            ->icon('heroicon-o-eye')
            ->color('info')
            ->url(fn(PdfConverter $record): string => PdfConverterResource::getUrl('view', ['record' => $record])),
            Tables\Actions\Action::make('download_front')
            ->label('Download Front')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('success')
            ->url(fn(PdfConverter $record) => asset('storage/' . $record->front_image_path))
            ->openUrlInNewTab(),
            Tables\Actions\Action::make('download_back')
            ->label('Download Back')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('success')
            ->url(fn(PdfConverter $record) => asset('storage/' . $record->back_image_path))
            ->openUrlInNewTab(),
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
            'index' => Pages\ListPdfConverters::route('/'),
            'create' => Pages\CreatePdfConverter::route('/create'),
            'view' => Pages\ViewPdfConverter::route('/{record}'),
        ];
    }
}

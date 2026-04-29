<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PanRequestResource\Pages;
use App\Models\PanRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PanRequestResource extends Resource
{
    protected static ?string $model = PanRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-identification';

    protected static ?string $navigationGroup = 'PAN Card';

    protected static ?string $modelLabel = 'PAN Card Application';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Applicant Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->disabled()
                            ->label('Applicant Name'),
                        Forms\Components\TextInput::make('aadhar_number')
                            ->disabled()
                            ->label('Aadhar Number'),
                        Forms\Components\TextInput::make('mobile')
                            ->disabled()
                            ->label('Mobile Number'),
                        Forms\Components\TextInput::make('utr_number')
                            ->disabled()
                            ->label('Payment UTR / Transaction ID'),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending (Work in Process)',
                                'accepted' => 'Accepted (Done)',
                                'rejected' => 'Rejected',
                            ])
                            ->required()
                            ->label('Application Status'),
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Admin Remark')
                            ->helperText('Add reason for rejection or any other notes.'),
                    ])->columns(2),

                Forms\Components\Section::make('Uploaded Documents (View Only)')
                    ->schema([
                        Forms\Components\FileUpload::make('photo')
                            ->disk('public')
                            ->directory('pan-documents')
                            ->downloadable()
                            ->openable()
                            ->deletable(false)
                            ->image()
                            ->label('Applicant Photo (Download/View)'),
                        Forms\Components\FileUpload::make('signature')
                            ->disk('public')
                            ->directory('pan-documents')
                            ->downloadable()
                            ->openable()
                            ->deletable(false)
                            ->image()
                            ->label('Applicant Signature (Download/View)'),
                        Forms\Components\FileUpload::make('aadhar_card_doc')
                            ->disk('public')
                            ->directory('pan-documents')
                            ->downloadable()
                            ->openable()
                            ->deletable(false)
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->label('Aadhar Card Document (Download/View)'),
                        Forms\Components\FileUpload::make('additional_document')
                            ->disk('public')
                            ->directory('pan-documents')
                            ->downloadable()
                            ->openable()
                            ->deletable(false)
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->label('Additional Document (Download/View)'),
                    ])->columns(2),

                Forms\Components\Section::make('Admin Uploads')
                    ->schema([
                        Forms\Components\FileUpload::make('slip_document')
                            ->disk('public')
                            ->directory('pan-slips')
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->label('Upload Acknowledgement Slip')
                            ->helperText('Upload the slip to show it to the user.'),
                        Forms\Components\FileUpload::make('final_pdf')
                            ->disk('public')
                            ->directory('pan-final-pdfs')
                            ->acceptedFileTypes(['application/pdf'])
                            ->label('Upload Final PAN Card PDF')
                            ->helperText('Upload the generated PAN Card here.'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d M Y, h:i A')
                    ->sortable()
                    ->label('Date Submitted'),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Submitted By')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->label('Applicant Name'),
                Tables\Columns\TextColumn::make('aadhar_number')
                    ->searchable()
                    ->label('Aadhar Number'),
                Tables\Columns\TextColumn::make('utr_number')
                    ->searchable()
                    ->label('UTR No.'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'accepted',
                        'danger' => 'rejected',
                    ])
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->label('Status'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('accept')
                    ->label('Accept')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->action(fn (PanRequest $record) => $record->update(['status' => 'accepted']))
                    ->requiresConfirmation()
                    ->modalHeading('Accept Application')
                    ->modalDescription('Are you sure you want to accept this application? You can upload the PDF and slip later.')
                    ->hidden(fn (PanRequest $record) => $record->status !== 'pending'),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-circle')
                    ->form([
                        Forms\Components\Textarea::make('admin_notes')
                            ->label('Reason for Rejection')
                            ->required(),
                    ])
                    ->action(function (PanRequest $record, array $data) {
                        $record->update([
                            'status' => 'rejected',
                            'admin_notes' => $data['admin_notes'],
                        ]);
                    })
                    ->hidden(fn (PanRequest $record) => $record->status !== 'pending'),
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
            'index' => Pages\ListPanRequests::route('/'),
            'create' => Pages\CreatePanRequest::route('/create'),
            'edit' => Pages\EditPanRequest::route('/{record}/edit'),
        ];
    }
}

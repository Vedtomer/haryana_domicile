<?php

$replacements = [
    'app/Filament/Pages/PhoneToDetail.php' => 'page_PhoneToDetail',
    'app/Filament/Pages/FamilyDataSearch.php' => 'page_FamilyDataSearch',
    'app/Filament/Pages/VehicleDetail.php' => 'page_VehicleDetail',
    'app/Filament/Pages/PhoneToAadhar.php' => 'page_PhoneToAadhar',
    'app/Filament/Pages/FasalSearch.php' => 'page_FasalSearch',
    'app/Filament/Pages/CustomDashboard.php' => 'page_CustomDashboard',
    'app/Filament/Resources/PdfConverterResource.php' => 'view_any_pdf::converter',
    'app/Filament/Resources/BirthRecordResource.php' => 'view_any_birth::record',
    'app/Filament/Resources/ServiceRequestResource.php' => 'view_any_service::request',
    'app/Filament/Resources/HaryanaDomicileResource.php' => 'view_any_haryana::domicile',
];

foreach ($replacements as $file => $permission) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        // Find both variations
        $pattern1 = "/return auth\(\)->user\(\) && auth\(\)->user\(\)->type === 'user';/";
        $pattern2 = "/return auth\(\)->check\(\) && auth\(\)->user\(\)->type === 'user';/";
        
        $replacement = "return auth()->check() && auth()->user()->can('{$permission}');";
        
        $content = preg_replace($pattern1, $replacement, $content);
        $content = preg_replace($pattern2, $replacement, $content);
        
        file_put_contents($path, $content);
        echo "Updated {$file}\n";
    }
}

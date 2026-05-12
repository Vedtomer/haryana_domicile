<?php

namespace App\Filament\Resources\Shield\RoleResource;

class PermissionSchema {
    public static function getSidebarOptions(): array
    {
        return [
            'Basic Services' => [
                'haryana_domicile' => 'Haryana Domicile',
                'birth_record' => 'Birth Records',
                'pan_request' => 'PAN Card Portal',
                'pdf_converter' => 'PDF Converter',
            ],
            'Search Services' => [
                'fasal_search' => 'PPP Fasal Search',
                'family_data_search' => 'Aadhar to Family Data',
                'phone_to_aadhar' => 'Phone to Aadhar',
                'phone_to_detail' => 'Phone to Detail',
                'vehicle_detail' => 'Vehicle Detail',
            ],
            'Manual Services' => [
                'manual_service' => 'Manual Services (Aadhar/PAN/GST etc)',
            ],
            'Other' => [
                'service_request' => 'My Requests & Replies',
            ]
        ];
    }
    
    public static function getTopbarOptions(): array
    {
        return [
            'System Management' => [
                'user' => 'User Management',
                'role' => 'Role Management',
            ],
        ];
    }
    
    public static function getDashboardOptions(): array
    {
        return [
            'Dashboard' => [
                'dashboard' => 'Enable Dashboard',
            ],
        ];
    }

    /**
     * Map a simplified module key to its full set of permissions.
     */
    public static function getModulePermissions(string $module): array
    {
        $permissions = [
            'haryana_domicile' => [
                'view_any_haryana::domicile',
                'view_haryana::domicile',
                'create_haryana::domicile',
                'update_haryana::domicile',
                'delete_haryana::domicile',
                'delete_any_haryana::domicile',
            ],
            'birth_record' => [
                'view_any_birth::record',
                'view_birth::record',
                'create_birth::record',
                'update_birth::record',
                'delete_birth::record',
                'delete_any_birth::record',
            ],
            'pan_request' => [
                'view_any_pan::request',
                'view_pan::request',
                'create_pan::request',
                'update_pan::request',
                'delete_pan::request',
                'delete_any_pan::request',
            ],
            'pdf_converter' => [
                'view_any_pdf::converter',
                'view_pdf::converter',
                'create_pdf::converter',
                'update_pdf::converter',
                'delete_pdf::converter',
                'delete_any_pdf::converter',
            ],
            'user' => [
                'view_any_user::management',
                'view_user::management',
                'create_user::management',
                'update_user::management',
                'delete_user::management',
                'delete_any_user::management',
            ],
            'role' => [
                'view_any_shield::role',
                'view_shield::role',
                'create_shield::role',
                'update_shield::role',
                'delete_shield::role',
                'delete_any_shield::role',
            ],
            'service_request' => [
                'view_any_service::request',
                'view_service::request',
                'create_service::request',
                'update_service::request',
                'delete_service::request',
                'delete_any_service::request',
            ],
            'fasal_search' => ['page_FasalSearch'],
            'family_data_search' => ['page_FamilyDataSearch'],
            'phone_to_aadhar' => ['page_PhoneToAadhar'],
            'phone_to_detail' => ['page_PhoneToDetail'],
            'vehicle_detail' => ['page_VehicleDetail'],
            'manual_service' => ['page_ManualService'],
            'dashboard' => ['page_CustomDashboard'],
        ];

        return $permissions[$module] ?? [];
    }
}

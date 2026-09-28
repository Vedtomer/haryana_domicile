<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure aadhar_updates table exists and has all fields
        if (!Schema::hasTable('aadhar_updates')) {
            Schema::create('aadhar_updates', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('date', 20)->nullable();
                $table->string('resident_status', 50)->default('Resident');
                $table->string('request_type', 50)->default('Update Request');
                $table->string('aadhar_number', 20);
                $table->string('name', 255);
                $table->string('c_o', 255)->nullable();
                $table->string('house_no', 255)->nullable();
                $table->string('street', 255)->nullable();
                $table->string('landmark', 255)->nullable();
                $table->string('locality', 255)->nullable();
                $table->string('village_town', 255);
                $table->string('post_office', 255)->nullable();
                $table->string('district', 255);
                $table->string('state', 255);
                $table->string('pin_code', 10);
                $table->string('certifier_name', 255)->nullable();
                $table->string('certifier_designation', 255)->nullable();
                $table->string('certifier_address', 255)->nullable();
                $table->string('certifier_address2', 255)->nullable();
                $table->string('certifier_contact', 50)->nullable();
                $table->string('certifier_category', 100)->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('aadhar_updates', function (Blueprint $table) {
                if (!Schema::hasColumn('aadhar_updates', 'date')) {
                    $table->string('date', 20)->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('aadhar_updates', 'resident_status')) {
                    $table->string('resident_status', 50)->default('Resident')->after('date');
                }
                if (!Schema::hasColumn('aadhar_updates', 'request_type')) {
                    $table->string('request_type', 50)->default('Update Request')->after('resident_status');
                }
                if (!Schema::hasColumn('aadhar_updates', 'certifier_address2')) {
                    $table->string('certifier_address2', 255)->nullable()->after('certifier_address');
                }
                if (!Schema::hasColumn('aadhar_updates', 'certifier_category')) {
                    $table->string('certifier_category', 100)->nullable()->after('certifier_contact');
                }
            });
        }

        // 2. Add or update the service in services table
        $service = DB::table('services')->where('slug', 'aadhar-card-form')->orWhere('slug', 'aadhar-update')->first();

        $serviceData = [
            'name' => 'Aadhar Card form',
            'slug' => 'aadhar-card-form',
            'description' => 'Certificate for Aadhaar Enrolment / Update (Proof of Address) Form Generator',
            'icon' => '🪪',
            'coin_cost' => 9,
            'kind' => 'module',
            'module_key' => 'aadhar_card_form',
            'fields' => null,
            'is_active' => true,
            'visibility' => 'public',
            'is_premium' => false,
            'unlock_cost' => 0,
            'sort_order' => 1,
            'updated_at' => now(),
        ];

        if ($service) {
            DB::table('services')->where('id', $service->id)->update($serviceData);
            $serviceId = $service->id;
        } else {
            $serviceData['created_at'] = now();
            $serviceId = DB::table('services')->insertGetId($serviceData);
        }

        // 3. Grant service to all users
        $allUserIds = DB::table('users')->pluck('id')->toArray();
        foreach ($allUserIds as $uId) {
            DB::table('service_user')->updateOrInsert(
                ['service_id' => $serviceId, 'user_id' => $uId],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

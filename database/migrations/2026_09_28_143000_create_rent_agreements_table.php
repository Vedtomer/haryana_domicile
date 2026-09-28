<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('rent_agreements')) {
            Schema::create('rent_agreements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();

                // First Party (Tenant)
                $table->string('first_party_name');
                $table->string('first_party_aadhar')->nullable();
                $table->string('first_party_father_name');
                $table->text('first_party_address');

                // Second Party (Landlord / Owner)
                $table->string('second_party_name');
                $table->string('second_party_father_name');
                $table->text('second_party_address');
                $table->string('property_owner_title')->default('Warehouse Owner');

                // Property Details
                $table->string('property_type')->default('warehouse');
                $table->string('property_area')->default('80 square yards');
                $table->text('property_location')->nullable();
                $table->string('property_city')->default('Panipat');

                // Tenancy & Rent Terms
                $table->integer('tenancy_months')->default(11);
                $table->string('from_date');
                $table->string('to_date');
                $table->string('monthly_rent');
                $table->string('monthly_rent_words');
                $table->string('agreement_date');

                $table->timestamps();
            });
        }

        // Configure Services table: both rent-agreement and bob-affidavit point to this module
        $allUserIds = DB::table('users')->pluck('id')->toArray();

        // 1. rent-agreement
        $rentService = DB::table('services')->where('slug', 'rent-agreement')->first();
        if ($rentService) {
            DB::table('services')->where('id', $rentService->id)->update([
                'name' => 'Rent Agreement',
                'description' => 'Official Rent Agreement Generator - Generate, edit and print authentic 2-page Rent Agreements with adhesive stamps and notary seals.',
                'icon' => '📜',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'rent_agreement',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'updated_at' => now(),
            ]);
            $rentId = $rentService->id;
        } else {
            $rentId = DB::table('services')->insertGetId([
                'name' => 'Rent Agreement',
                'slug' => 'rent-agreement',
                'description' => 'Official Rent Agreement Generator - Generate, edit and print authentic 2-page Rent Agreements with adhesive stamps and notary seals.',
                'icon' => '📜',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'rent_agreement',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. bob-affidavit (update so if user clicks it, it acts as Rent Agreement / Affidavit module)
        $bobService = DB::table('services')->where('slug', 'bob-affidavit')->first();
        if ($bobService) {
            DB::table('services')->where('id', $bobService->id)->update([
                'name' => 'Rent Agreement (BOB Affidavit)',
                'description' => 'Official Rent Agreement / Affidavit Generator - Generate, edit and print authentic 2-page Rent Agreements with adhesive stamps and notary seals.',
                'icon' => '📜',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'rent_agreement',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'updated_at' => now(),
            ]);
            $bobId = $bobService->id;
        } else {
            $bobId = DB::table('services')->insertGetId([
                'name' => 'Rent Agreement (BOB Affidavit)',
                'slug' => 'bob-affidavit',
                'description' => 'Official Rent Agreement / Affidavit Generator - Generate, edit and print authentic 2-page Rent Agreements with adhesive stamps and notary seals.',
                'icon' => '📜',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'rent_agreement',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Attach both to all users in service_user table
        foreach ([$rentId, $bobId] as $srvId) {
            if (!$srvId) continue;
            foreach ($allUserIds as $uId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $srvId, 'user_id' => $uId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rent_agreements');
    }
};

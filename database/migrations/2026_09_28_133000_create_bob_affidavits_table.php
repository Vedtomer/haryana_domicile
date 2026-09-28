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
        if (!Schema::hasTable('bob_affidavits')) {
            Schema::create('bob_affidavits', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('father_name');
                $table->string('gender')->default('Male');
                $table->integer('age')->nullable();
                $table->date('dob')->nullable();
                $table->string('mobile', 15);
                $table->string('aadhar', 20)->nullable();
                $table->string('pan_no', 15)->nullable();
                $table->text('village'); // Address / Street / Village
                $table->string('tehsil');
                $table->string('district');
                $table->string('state')->default('Haryana');
                $table->string('pincode', 10)->nullable();
                $table->string('account_no', 50);
                $table->string('cif_no', 50)->nullable();
                $table->string('branch_name');
                $table->string('ifsc_code', 25)->nullable()->default('BARB0');
                $table->string('affidavit_type')->default('general');
                $table->text('reason');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Update the BOB Affidavit service to be a full built-in module
        $service = DB::table('services')->where('slug', 'bob-affidavit')->first();
        if ($service) {
            DB::table('services')->where('id', $service->id)->update([
                'name' => 'BOB Affidavit',
                'description' => 'Bank of Baroda (BOB) Official Affidavit Generator - Create, download and print bank affidavits for name correction, mobile update, passbook loss, and account activation.',
                'icon' => '🏦',
                'coin_cost' => 149,
                'kind' => 'module',
                'module_key' => 'bob_affidavit',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'updated_at' => now(),
            ]);

            // Ensure all users have access in service_user
            $allUserIds = DB::table('users')->pluck('id')->toArray();
            foreach ($allUserIds as $userId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $service->id, 'user_id' => $userId],
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
        Schema::dropIfExists('bob_affidavits');
    }
};

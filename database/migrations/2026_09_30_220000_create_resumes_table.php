<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable()->default('Professional Resume');
            $table->string('full_name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('dob')->nullable();
            $table->string('gender', 20)->nullable()->default('Male');
            $table->string('marital_status', 30)->nullable()->default('Single');
            $table->string('nationality', 50)->nullable()->default('Indian');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->text('address')->nullable();
            $table->string('photo_url')->nullable();
            $table->text('career_objective')->nullable();
            $table->json('education')->nullable();
            $table->json('experience')->nullable();
            $table->json('skills')->nullable();
            $table->json('languages')->nullable();
            $table->json('hobbies')->nullable();
            $table->text('declaration')->nullable();
            $table->string('place')->nullable();
            $table->string('date')->nullable();
            $table->string('template_style', 30)->default('modern');
            $table->string('accent_color', 20)->default('#1e3a8a');
            $table->timestamps();
        });

        // Insert service into services table if it doesn't already exist
        $serviceExists = DB::table('services')->where('slug', 'resume-maker')->exists();
        if (!$serviceExists) {
            $serviceId = DB::table('services')->insertGetId([
                'name' => 'Resume / CV Maker',
                'slug' => 'resume-maker',
                'description' => 'Automated Professional Resume, CV & Bio-Data Generator - Create, customize and print authentic 1-page Resumes with photo.',
                'icon' => '📄',
                'coin_cost' => 20,
                'kind' => 'module',
                'module_key' => 'resume_maker',
                'fields' => null,
                'is_active' => true,
                'visibility' => 'public',
                'is_premium' => false,
                'unlock_cost' => 0,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign to all existing users
            $allUserIds = DB::table('users')->pluck('id')->toArray();
            foreach ($allUserIds as $uId) {
                DB::table('service_user')->updateOrInsert(
                    ['service_id' => $serviceId, 'user_id' => $uId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('resumes');
        DB::table('services')->where('slug', 'resume-maker')->delete();
    }
};

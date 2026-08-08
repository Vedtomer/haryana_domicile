<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('user_id')
                ->constrained()->nullOnDelete();
            $table->unsignedInteger('coins_charged')->default(0)->after('input_data');
            $table->string('estimated_time')->nullable()->after('admin_response');
            $table->timestamp('refunded_at')->nullable()->after('completed_at');
        });

        // Widen `status` from the original 3-value enum so the admin can move a
        // request through accepted / in_progress as well.
        DB::statement("ALTER TABLE service_requests MODIFY status VARCHAR(20) NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE service_requests MODIFY input_data TEXT NULL");
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn(['service_id', 'coins_charged', 'estimated_time', 'refunded_at']);
        });

        DB::statement("ALTER TABLE service_requests MODIFY status ENUM('pending','completed','rejected') NOT NULL DEFAULT 'pending'");
    }
};

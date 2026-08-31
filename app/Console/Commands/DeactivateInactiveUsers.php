<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class DeactivateInactiveUsers extends Command
{
    /**
     * Signature + options
     *  --days=7   : inactivity threshold (override for testing)
     *  --dry-run  : log but don't update
     */
    protected $signature   = 'users:deactivate-inactive
                                {--days=7 : Inactivity threshold in days}
                                {--dry-run : Show who would be deactivated without making changes}';

    protected $description = 'Auto-deactivate users who have been inactive for N days';

    public function handle(): int
    {
        $days   = (int) $this->option('days');
        $dryRun = $this->option('dry-run');
        $cutoff = now()->subDays($days);

        $query = User::where('type', 'user')
            ->where('is_active', 1)
            ->where(function ($q) use ($cutoff) {
                // Either last_activity_at is older than cutoff, or it is NULL
                $q->whereNull('last_activity_at')
                  ->orWhere('last_activity_at', '<', $cutoff);
            });

        $count = $query->count();

        if ($count === 0) {
            $this->info('No inactive users found.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} inactive user(s) (no activity for {$days}+ days).");

        if ($dryRun) {
            $query->each(fn(User $u) =>
                $this->line("  [DRY-RUN] Would deactivate: {$u->name} (id={$u->id})")
            );
            return self::SUCCESS;
        }

        $query->each(function (User $user) {
            $user->update([
                'is_active'          => false,
                'deactivated_reason' => 'inactivity',
            ]);
            $this->line("  Deactivated: {$user->name} (id={$user->id})");
        });

        $this->info("Done. {$count} user(s) deactivated.");
        return self::SUCCESS;
    }
}

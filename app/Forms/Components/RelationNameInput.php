<?php

namespace App\Forms\Components;

use Filament\Forms\Components\Field;

class RelationNameInput extends Field
{
    protected string $view = 'forms.components.relation-name-input';
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->afterStateHydrated(function (RelationNameInput $component, $state) {
            if (is_string($state) && $state) {
                $prefix = 'S/o';
                $name = $state;
                
                foreach (['S/o', 'D/o', 'W/o', 'H/o', 'C/o'] as $p) {
                    if (str_starts_with($state, $p . ' ')) {
                        $prefix = $p;
                        $name = substr($state, strlen($p) + 1);
                        break;
                    }
                }
                
                $component->state([
                    'prefix' => $prefix,
                    'name' => $name,
                ]);
            } elseif (!$state) {
                $component->state([
                    'prefix' => 'S/o',
                    'name' => '',
                ]);
            }
        });
        
        $this->dehydrateStateUsing(function ($state) {
            if (is_array($state) && isset($state['name'])) {
                $prefix = $state['prefix'] ?? 'S/o';
                $name = trim($state['name'] ?? '');
                return $name ? $prefix . ' ' . $name : '';
            }
            return $state;
        });
    }
}

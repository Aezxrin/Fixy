<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $roles = [
        ['name' => 'admin', 'display_name' => 'Админ'],
        ['name' => 'manager', 'display_name' => 'Үйлчилгээний менежер'],
        ['name' => 'finance', 'display_name' => 'Санхүүгийн ажилтан'],
        ['name' => 'customer', 'display_name' => 'Иргэн'],
        ['name' => 'technician', 'display_name' => 'Засварчин'],
    ];

    foreach ($roles as $role) {
        \App\Models\Role::updateOrCreate(['name' => $role['name']], $role);
    }
}
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@fixy.mn'],
            [
                'name' => 'Admin',
                'password' => Hash::make('Admin1234'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}
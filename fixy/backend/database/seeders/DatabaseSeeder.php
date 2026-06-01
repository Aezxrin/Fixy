<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Хамгийн түрүүнд Role буюу эрхүүдийг үүсгэнэ
        $this->call([
            RoleSeeder::class,
        ]);

        // 2. Системийн Админ (role_id: 1)
        User::updateOrCreate(
            ['email' => 'admin@fixy.mn'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('Admin123'),
                'phone' => '99001122',
                'role_id' => 1,
                'status' => 'active',
            ]
        );

        // 3. Менежер (role_id: 2)
        User::updateOrCreate(
            ['email' => 'manager@fixy.mn'],
            [
                'name' => 'Үйлчилгээний Менежер',
                'password' => Hash::make('Manager123'),
                'phone' => '88001122',
                'role_id' => 2,
                'status' => 'active',
            ]
        );

        // 4. Санхүүч (role_id: 3)
        User::updateOrCreate(
            ['email' => 'finance@fixy.mn'],
            [
                'name' => 'Санхүүгийн Ажилтан',
                'password' => Hash::make('Finance123'),
                'phone' => '77001122',
                'role_id' => 3,
                'status' => 'active',
            ]
        );
    }
}
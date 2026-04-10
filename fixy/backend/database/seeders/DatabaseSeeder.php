<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        // 2. Үндсэн 3 хэрэглэгчийг автоматаар үүсгэх
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@fixy.mn',
            'password' => Hash::make('Admin123'),
            'phone' => '99001122',
            'role_id' => 1,
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Үйлчилгээний Менежер',
            'email' => 'manager@fixy.mn',
            'password' => Hash::make('Manager123'),
            'phone' => '88001122',
            'role_id' => 2,
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Санхүүгийн Ажилтан',
            'email' => 'finance@fixy.mn',
            'password' => Hash::make('Finance123'),
            'phone' => '77001122',
            'role_id' => 3,
            'status' => 'active',
        ]);
    }
}
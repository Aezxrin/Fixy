<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    // 1. Үйлчилгээний менежер хаяг үүсгэх
    \App\Models\User::create([
        'name' => 'Service Manager',
        'email' => 'manager@fixy.mn',
        'phone' => '88001122',
        'password' => bcrypt('manager123'),
        'role' => 'manager', // Role-ийг 'manager' болгох
        'status' => 'active'
    ]);

    // 2. Баталгаажуулалт хүлээж буй (unverified) 5 засварчин үүсгэх
    for ($i = 0; $i < 5; $i++) {
        \App\Models\User::create([
            'name' => 'Tech Candidate ' . ($i + 1),
            'email' => 'tech'.$i.'@example.com',
            'phone' => '9900000'.$i,
            'password' => bcrypt('password123'),
            'role' => 'technician',
            'status' => 'inactive', // Хараахан баталгаажаагүй
        ]);
    }
}
}


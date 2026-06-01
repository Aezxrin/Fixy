<!DOCTYPE html>
<html lang="mn">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Үйлчлүүлэгчдийн тайлан</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1e293b; }
        .header-table { width: 100%; border-bottom: 2px solid #1e3a8a; margin-bottom: 20px; padding-bottom: 10px; }
        .app-title { font-size: 16px; font-weight: bold; color: #1e3a8a; }
        .document-title { font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th { background-color: #1e3a8a; color: #ffffff; padding: 8px; text-align: left; border: 1px solid #1e3a8a; }
        table.data-table td { padding: 8px; border: 1px solid #e2e8f0; }
        table.data-table tr:nth-child(even) td { background-color: #f8fafc; }
        .badge { padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-active { background-color: #dcfce7; color: #15803d; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 50%;"><div class="app-title">ЗАСВАРЫН ДУУДЛАГЫН ПРОГРАММ</div></td>
            <td style="width: 50%; text-align: right; color: #64748b;">
                <div><strong>Тайлангийн төрөл:</strong> Үйлчлүүлэгчдийн нэгдсэн тайлан</div>
                <div><strong>Хэвлэсэн огноо:</strong> {{ date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>
    <div class="document-title">ҮЙЛЧЛҮҮЛЭГЧДИЙН НЭГДСЭН ТАЙЛАН</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;">ID</th>
                <th style="width: 25%;">Овог Нэр</th>
                <th style="width: 30%;">И-мэйл хаяг</th>
                <th style="width: 20%;">Бүртгүүлсэн огноо</th>
                <th style="width: 15%;">Төлөв</th>
            </tr>
        </thead>
        <tbody>
            @forelse($customers as $user)
            <tr>
                <td>#C-{{ $user->id }}</td>
                <td>{{ $user->name }}</td>
                <td>{{ $user->email }}</td>
                <td>{{ $user->created_at ? date('Y-m-d', strtotime($user->created_at)) : '-' }}</td>
                <td><span class="badge badge-active">{{ $user->status ?? 'Идэвхтэй' }}</span></td>
            </tr>
            @empty
            <tr><td colspan="5" style="text-align: center;">Мэдээлэл олдсонгүй</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
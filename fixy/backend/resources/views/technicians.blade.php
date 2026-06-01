<!DOCTYPE html>
<html lang="mn">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a8a; color: #fff; padding: 8px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        .rating-high { color: #16a34a; font-weight: bold; }
        .rating-mid { color: #d97706; font-weight: bold; }
        .rating-low { color: #dc2626; font-weight: bold; }
        .status-badge {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        }
        .status-active { background-color: #dcfce7; color: #15803d; }
        .status-pending { background-color: #fef3c7; color: #b45309; }
        .status-suspended { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <div class="app-title">ЗАСВАРЫН ДУУДЛАГЫН ПРОГРАММ</div>
            </td>
            <td style="width: 50%; text-align: right; color: #64748b;">
                <div><strong>Тайлангийн төрөл:</strong> Засварчдын нэгдсэн мэдээлэл</div>
                <div><strong>Хэвлэсэн огноо:</strong> {{ date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>
    <h2>Засварчдын нэгдсэн тайлан</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Нэр</th>
                <th>И-мэйл</th>
                <th>Үйлчилгээний төрөл</th>
                <th>Гүйцэтгэсэн ажил</th>
                <th>Дундаж үнэлгээ</th>
                <th>Төлөв</th>
            </tr>
        </thead>
        <tbody>
            @foreach($technicians as $tech)
            <tr>
                <td>#T-{{ $tech->id }}</td>
                <td>{{ $tech->name }}</td>
                <td>{{ $tech->email }}</td>
                <td>{{ $tech->service_type ?? 'Тодорхойгүй' }}</td>
                
                <td>
                    <span class="{{ $tech->avg_rating >= 4.5 ? 'rating-high' : ($tech->avg_rating >= 4.0 ? 'rating-mid' : 'rating-low') }}">
                        {{ $tech->avg_rating > 0 ? number_format($tech->avg_rating, 1) . ' ★' : 'Үнэлгээгүй' }}
                    </span>
                </td>
                
                <td>
                    <span class="status-badge {{ $tech->status == 'active' ? 'status-active' : ($tech->status == 'pending' ? 'status-pending' : 'status-suspended') }}">
                        @if($tech->status == 'active') Идэвхтэй
                        @elseif($tech->status == 'pending') Хүлээгдэж буй
                        @elseif($tech->status == 'suspended') Түдгэлзүүлсэн
                        @else {{ ucfirst($tech->status) }}
                        @endif
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
<!DOCTYPE html>
<html lang="mn">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Дуудлагын тайлан</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1e293b;
        }       
        .header-table { width: 100%; border-bottom: 2px solid #1e3a8a; margin-bottom: 20px; padding-bottom: 10px; }
        .app-title { font-size: 16px; font-weight: bold; color: #1e3a8a; }
        .document-title { font-size: 14px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }       
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th {
            background-color: #1e3a8a; color: #ffffff; font-weight: bold; padding: 8px; text-align: left; border: 1px solid #1e3a8a;
        }
        table.data-table td { padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; }
        table.data-table tr:nth-child(even) td { background-color: #f8fafc; }
        .badge-success { color: #15803d; font-weight: bold; }
        .badge-warning { color: #b45309; font-weight: bold; }
        .rating-star { color: #f59e0b; font-weight: bold; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <div class="app-title">ЗАСВАРЫН ДУУДЛАГЫН ПРОГРАММ</div>
            </td>
            <td style="width: 50%; text-align: right; color: #64748b;">
                <div><strong>Тайлангийн төрөл:</strong> Дуудлага, захиалгын нэгдсэн мэдээлэл</div>
                <div><strong>Хэвлэсэн огноо:</strong> {{ date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>

    <div class="document-title">ДУУДЛАГА, ЗАХИАЛГЫН ТАЙЛАН</div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 4%;">ID</th>
                <th style="width: 8%;">Төрөл</th>              
                <th style="width: 8%;">Өмнөх зураг</th>     
                <th style="width: 8%;">Дараах зураг</th>               
                <th style="width: 10%;">Засварчин</th>
                <th style="width: 10%;">Үйлчлүүлэгч</th>               
                <th style="width: 15%;">Хаяг, байршил</th> 
                <th style="width: 15%;">Асуудлын тайлбар</th>               
                <th style="width: 6%;">Үнэлгээ</th>
                <th style="width: 8%;">Төлбөр</th>
                <th style="width: 8%;">Төлөв</th>
            </tr>
        </thead>
        <tbody>
            @forelse($calls as $call)
            <tr>
                <td>{{ $call->id }}</td>
                <td>{{ $call->service_type ?? 'Тодорхойгүй' }}</td>               
                <td>
                    @if($call->image_path)
                        <a href="{{ asset('storage/' . $call->image_path) }}" target="_blank" style="color: #2563eb; text-decoration: underline; font-size: 11px;">
                            Зураг үзэх
                        </a>
                    @else
                        <span style="color: #999; font-size: 10px;">Зураггүй</span>
                    @endif
                </td>
                
                <td>
                    @if($call->completed_image_path)
                        <a href="{{ asset('storage/' . $call->completed_image_path) }}" target="_blank" style="color: #2563eb; text-decoration: underline; font-size: 11px;">
                            Зураг үзэх
                        </a>
                    @else
                        <span style="color: #999; font-size: 10px;">Зураг оруулаагүй</span>
                    @endif
                </td>
                <td>{{ $call->tech_name ? $call->tech_name : 'Оноогдоогүй' }}</td>
                <td>{{ $call->customer_name ? $call->customer_name : 'Тодорхойгүй' }}</td>              
                <td>{{ $call->address ?? 'Хаяг оруулаагүй' }}</td>                
                <td>{{ $call->description ?? 'Тайлбаргүй' }}</td>                
                <td>
                    @if($call->rating)
                        <span class="rating-star">★ {{ $call->rating }}</span>
                    @else
                        -
                    @endif
                </td>               
                <td>{{ $call->price ? number_format($call->price) . ' ₮' : '0 ₮' }}</td>               
                <td>
                    @if($call->status == 'completed')
                        <span class="badge-success">Дууссан</span>
                    @elseif($call->status == 'pending')
                        <span class="badge-warning">Хүлээгдэж буй</span>
                    @else
                        <span class="badge-warning">{{ ucfirst($call->status) }}</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="11" style="text-align: center;">Одоогоор дуудлагын түүх байхгүй байна.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
    </table>

<div style="margin-top: 50px; font-size: 11px; color: #444; border-top: 2px solid #1e3a8a; padding-top: 15px;">
    <table style="width: 100%; border: none;">
        <tr>
            <td style="border: none; width: 33%;">
                <strong>Тайлан боловсруулсан:</strong><br><br>
                Гарын үсэг: ____________________<br><br>
                Албан тушаал: Үйлчилгээний менежер
            </td>
            <td style="border: none; width: 34%; text-align: center; vertical-align: top;">
                <strong>Засварын дуудлагын программ</strong><br>
                Утас: 94312147<br>
                И-мэйл: info@fixy.mn<br>
                Вэб: www.fixy.mn
            </td>
            <td style="border: none; width: 33%; text-align: right;">
                <strong>Хянаж, баталсан:</strong><br><br>
                Гарын үсэг: ____________________<br><br>
                Албан тушаал: Захирал
            </td>
        </tr>
    </table>
</div>
</body>
</html>
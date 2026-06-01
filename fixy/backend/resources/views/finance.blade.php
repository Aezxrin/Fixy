<!DOCTYPE html>
<html lang="mn">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Санхүүгийн тайлан</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1e293b; }
        .header-table { width: 100%; border-bottom: 2px solid #1e3a8a; margin-bottom: 20px; padding-bottom: 10px; }
        .app-title { font-size: 16px; font-weight: bold; color: #1e3a8a; }
        .document-title { font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        table.data-table th { background-color: #1e3a8a; color: #ffffff; padding: 8px; text-align: left; border: 1px solid #1e3a8a; }
        table.data-table td { padding: 8px; border: 1px solid #e2e8f0; }
        table.data-table tr:nth-child(even) td { background-color: #f8fafc; }
        .amt-total { font-weight: bold; color: #1e3a8a; }
        .amt-fee { font-weight: bold; color: #b45309; }
        .amt-net { font-weight: bold; color: #15803d; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 50%;"><div class="app-title">ЗАСВАРЫН ДУУДЛАГЫН ПРОГРАММ</div></td>
            <td style="width: 50%; text-align: right; color: #64748b;">
                <div><strong>Тайлангийн төрөл:</strong> Санхүүгийн нэгдсэн тайлан</div>
                <div><strong>Хэвлэсэн огноо:</strong> {{ date('Y-m-d') }}</div>
            </td>
        </tr>
    </table>
    <div class="document-title">САНХҮҮГИЙН НЭГДСЭН ТАЙЛАН (Дууссан ажлууд)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25%;">Засварчны нэр</th>
                <th style="width: 15%;">Гүйцэтгэсэн ажил</th>
                <th style="width: 20%;">Нийт борлуулалт</th>
                <th style="width: 20%;">Системийн шимтгэл (10%)</th>
                <th style="width: 20%;">Цэвэр цалин (90%)</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $sum_jobs = 0; $sum_rev = 0; $sum_fee = 0; $sum_net = 0; 
            @endphp
            
            @forelse($calls as $row)
                @php
                    $fee = $row->total_revenue * 0.10;
                    $net = $row->total_revenue * 0.90;
                    
                    $sum_jobs += $row->total_jobs;
                    $sum_rev += $row->total_revenue;
                    $sum_fee += $fee;
                    $sum_net += $net;
                @endphp
            <tr>
                <td>{{ $row->tech_name }}</td>
                <td>{{ $row->total_jobs }} удаа</td>
                <td class="amt-total">{{ number_format($row->total_revenue) }} ₮</td>
                <td class="amt-fee">{{ number_format($fee) }} ₮</td>
                <td class="amt-net">{{ number_format($net) }} ₮</td>
            </tr>
            @empty
            <tr><td colspan="5" style="text-align: center;">Санхүүгийн мэдээлэл олдсонгүй</td></tr>
            @endforelse
            
            @if(count($calls) > 0)
            <tr style="background-color: #e2e8f0; font-weight: bold;">
                <td style="text-align: right;">НИЙТ:</td>
                <td>{{ $sum_jobs }} удаа</td>
                <td class="amt-total">{{ number_format($sum_rev) }} ₮</td>
                <td class="amt-fee">{{ number_format($sum_fee) }} ₮</td>
                <td class="amt-net">{{ number_format($sum_net) }} ₮</td>
            </tr>
            @endif
        </tbody>
    </table>
</body>
</html>
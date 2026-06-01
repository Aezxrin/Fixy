<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Цахим гэрээ - {{ $technician->name }}</title>
    <style>
        /* Албан бичгийн фонт тохируулах */
        body { 
            font-family: 'DejaVu Serif', serif; 
            font-size: 13px; 
            line-height: 1.6; 
            color: #1f2937; 
            padding: 20px 40px;
        }
        
        /* Толгой хэсэг */
        .title { 
            text-align: center; 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px; 
            text-transform: uppercase;
        }
        .date { 
            text-align: right; 
            font-style: italic; 
            color: #4b5563; 
            font-size: 12px; 
            margin-bottom: 30px;
        }

        /* Үндсэн текст болон догол мөр */
        .intro-text { 
            text-align: justify; 
            margin-bottom: 25px; 
        }
        .section-title { 
            font-weight: bold; 
            font-size: 14px; 
            margin-top: 20px; 
            margin-bottom: 10px; 
            text-transform: uppercase;
        }
        .paragraph { 
            text-align: justify; 
            margin-bottom: 10px; 
            padding-left: 5px;
        }

        /* Баталгаажуулах хэсэг */
        .confirmation-text {
            margin-top: 40px;
            margin-bottom: 40px;
            text-align: justify;
        }
        
        .divider {
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        }

        /* Гарын үсгийн хүснэгт (Зүүн болон Баруун багана) */
        .signature-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        .signature-table td { 
            width: 50%; 
            vertical-align: top; 
        }
        
        /* Зүүн тал - Менежер */
        .manager-side { padding-right: 20px; }
        .manager-label { font-weight: bold; margin-bottom: 5px; }
        .manager-sub { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
        .manager-status { 
            color: #2563eb; 
            font-style: italic; 
            font-weight: bold; 
            text-decoration: underline; 
            margin-top: 30px;
        }

        /* Баруун тал - Засварчин */
        .tech-side { padding-left: 20px; text-align: right; }
        .tech-label { font-weight: bold; }
        .tech-name { color: #6b7280; font-size: 12px; margin-bottom: 10px; }
        .signature-img { 
            max-width: 160px; 
            max-height: 80px; 
            display: inline-block; 
            border-bottom: 1px solid #1f2937;
            padding-bottom: 5px;
        }
        
        /* Хэрэв зураггүй бол гарах зураас */
        .empty-signature-line {
            display: inline-block;
            width: 160px;
            border-bottom: 1px solid #1f2937;
            margin-top: 40px;
        }
    </style>
</head>
<body>

    <div class="title">ЗАСВАРЧИНТАЙ ХАМТРАН АЖИЛЛАХ ГЭРЭЭ</div>
    <div class="date">Огноо: {{ $technician->contract_signed_at ? date('n/j/Y', strtotime($technician->contract_signed_at)) : date('n/j/Y') }}</div>

    <div class="intro-text">
        Энэхүү гэрээг нэг талаас <strong>"Fixy" платформ</strong> (цаашид "Компани" гэх), нөгөө талаас засварчин <strong>{{ $technician->name }}</strong> (цаашид "Засварчин" гэх) нар дараах нөхцөлөөр харилцан тохиролцож байгуулав.
    </div>

    <div class="section-title">НЭГ. НИЙТЛЭГ ҮНДЭС</div>
    <div class="paragraph">
        1.1 Засварчин нь платформоор дамжуулан үйлчлүүлэгчээс ирсэн дуудлагыг хүлээн авч, мэргэжлийн өндөр түвшинд, цаг тухайд нь засварын үйлчилгээ үзүүлэх үүрэгтэй.
    </div>
    <div class="paragraph">
        1.2 Компани нь засварчинг дуудлагаар хангаж, системийн хэвийн үйл ажиллагааг хариуцна.
    </div>

    <div class="section-title">ХОЁР. ТӨЛБӨР ТООЦОО</div>
    <div class="paragraph">
        2.1 Засварчин нь үйлчилгээний хөлснөөс платформын шимтгэл болох тодорхой хувийг Компанид төлөх үүрэгтэй.
    </div>
    <div class="paragraph">
        2.2 Үйлчлүүлэгчээс авах үйлчилгээний хөлс нь ил тод байх бөгөөд засварчин нь хэт өндөр үнэ нэхэх, хууран мэхлэх үйлдэл гаргахыг хатуу хориглоно.
    </div>

    <div class="section-title">ГУРАВ. ТАЛУУДЫН ЭРХ, ҮҮРЭГ</div>
    <div class="paragraph">
        3.1 <strong>Засварчны үүрэг:</strong> Дуудлагын цагийг баримтлах, үйлчлүүлэгчтэй соёлтой харилцах, хийсэн ажилдаа баталгаа гаргаж өгөх. Хувийн мэдээлэл болон баримт бичгийг үнэн зөвөөр мэдүүлэх.
    </div>
    <div class="paragraph">
        3.2 <strong>Компанийн эрх:</strong> Засварчин нь дүрэм зөрчсөн, үйлчлүүлэгчээс ноцтой гомдол ирсэн тохиолдолд гэрээг дангаар цуцалж, платформоос хасах эрхтэй.
    </div>

    <div class="section-title">ДӨРӨВ. ХАРИУЦЛАГА БА БУСАД</div>
    <div class="paragraph">
        4.1 Засварчин нь засвар үйлчилгээ хийх явцдаа үйлчлүүлэгчийн эд хөрөнгөд санаатай болон санамсаргүй байдлаар хохирол учруулсан тохиолдолд өөрийн зардлаар бүрэн барагдуулна.
    </div>
    <div class="paragraph">
        4.2 Энэхүү гэрээ нь цахимаар гарын үсэг зурсан өдрөөс эхлэн хүчин төгөлдөр болно.
    </div>

    <div class="divider"></div>

    <div class="confirmation-text">
        Би, <strong>{{ $technician->name }}</strong> нь энэхүү гэрээний нөхцөлийг бүрэн уншиж танилцаад, хүлээн зөвшөөрч доорх гарын үсгийг зурлаа.
    </div>

    @php
        $signatureData = null;
        if ($technician->signature_path && file_exists(public_path($technician->signature_path))) {
            $type = pathinfo(public_path($technician->signature_path), PATHINFO_EXTENSION);
            $data = file_get_contents(public_path($technician->signature_path));
            $signatureData = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }
    @endphp

    <table class="signature-table">
        <tr>
            <td class="manager-side">
                <div class="manager-label">Компанийг төлөөлж:</div>
                <div class="manager-sub">Менежер: {{ $manager->name ?? 'Үйлчилгээний менежер' }}</div>
                
                <div class="manager-status">/Батлагдсан/</div>
            </td>
            
            <td class="tech-side">
                <div class="tech-label">Засварчин:</div>
                <div class="tech-name">{{ $technician->name }}</div>
                
                @if($signatureData)
                    <img src="{{ $signatureData }}" class="signature-img" alt="Гарын үсэг">
                @else
                    <div class="empty-signature-line"></div>
                @endif
            </td>
        </tr>
    </table>

</body>
</html>
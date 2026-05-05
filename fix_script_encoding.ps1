
$file = "script.js"
$content = [System.IO.File]::ReadAllText((Get-Item $file).FullName)

# Common Mojibake replacements for Turkish (assuming it was Windows-1254 read as UTF-8)
$replacements = @{
    "lk" = "İlk";
    "doru" = "doğru";
    "Scak" = "Sıcak";
    "Se!" = "Seç!";
    "Se" = "Seç";
    "Giri" = "Giriş";
    "Kayt" = "Kayıt";
    "Kullanc" = "Kullanıcı";
    "ifre" = "Şifre";
    "Meydan Okuma" = "Meydan Okuma";
    "??ksek" = "üksek";
    "Baar" = "Başarı";
    "Hata" = "Hata";
    "Veri taban" = "Veri tabanı";
    "yklendi" = "yüklendi";
    "pucu" = "İpucu";
    "Yanl" = "Yanlış";
    "A" = "Aç";
    "Kapat" = "Kapat";
    "Geri" = "Geri";
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

[System.IO.File]::WriteAllText((Get-Item $file).FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Fixed $file"

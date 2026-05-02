$path = "c:\Users\Monster\OneDrive\Masaüstü\Antrigravitiy WS\script.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$mapping = @{
    'ğÅ¸â€ Å ' = '🔊'
    'ğÅ¸â€ â€¡' = '🔇'
    'ğÅ¸ÂŽÂ¯' = '🎯'
    'ğÅ¸â€ Â¥' = '🔥'
    'ğÅ¸ÂŽâ€ ' = '🎉'
    'ğÅ¸â€™Â¯' = '💯'
    'ğÅ¸â€œâ€¦' = '📅'
    'ğÅ¸Å’Â ' = '🌍'
    'ğÅ¸Â â‚¬' = '🏀'
    'ğÅ¸Â Â ' = '🏐'
    'ğÅ¸ÂŽÂ¾' = '🎾'
    'ğÅ¸Â ÂŽÃ¯Â¸Â ' = '🏎️'
    'ğÅ¸â€ Â«' = '🔫'
    'ğÅ¸Â Ë†' = '🏈'
    'ğÅ¸Â â€™' = '🏒'
    'ğÅ¸Â Â ' = '🏏'
    'ğÅ¸â€œÂ ' = '🗺️'
    'ğÅ¸â€˜Â¤' = '👤'
    'ğÅ¸Â â€ ' = '🏆'
    'ğÅ¸â€™â‚¬' = '💀'
    'ğÅ¸â€œâ€¹' = '📋'
    'ğÅ¸Å¸Â©' = '🟩'
    'ğÅ¸Å¸Â¥' = '🟧'
    'Ã¢Å“â€¦' = '✅'
    'Ã¢Å“â€¢' = '✖'
    'Ã¢â€ Â ' = '←'
    'Ã¢Å¡Â½' = '⚽'
    'Ã¢â€ºÂ¹Ã¯Â¸Â ' = '⛹️'
    'Ã¢Â Â±Ã¯Â¸Â ' = '⏳'
    'Ã¢Å¡â€ Ã¯Â¸Â ' = '⚔️'
    'Ã¢â€ºÂ¸Ã¯Â¸Â ' = '⛸️'
    'Ã¢Â â€žÃ¯Â¸Â ' = '❄️'
    'Ã¢Å’Â¨Ã¯Â¸Â ' = '⌨️'
    'Ã¢Å“Â¨' = '✨'
    'Ã„Â°' = 'İ'
    'Ã…Âž' = 'Ş'
    'ÃƒÅ“' = 'Ü'
    'Ãƒâ€“' = 'Ö'
    'Ãƒâ€¡' = 'Ç'
    'Ã„Å¸' = 'ğ'
    'Ã…Å¸' = 'ş'
    'ÃƒÂ¼' = 'ü'
    'ÃƒÂ¶' = 'ö'
    'ÃƒÂ§' = 'ç'
    'Ã„Â±' = 'ı'
}

foreach ($mangled in $mapping.Keys) {
    $content = $content.Replace($mangled, $mapping[$mangled])
}

# Fix setLanguage specifically
$pattern = '(?s)setLanguage\(lang\) \{.*?\}'
$replacement = 'setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.currentLang = lang;

        // Update all elements with data-i18n
        document.querySelectorAll(''[data-i18n]'').forEach(el => {
            const key = el.getAttribute(''data-i18n'');
            if (TRANSLATIONS[lang][key]) {
                el.innerText = TRANSLATIONS[lang][key];
            }
        });

        // Update placeholders
        if (this.inputEl && TRANSLATIONS[lang][''input_placeholder'']) {
            this.inputEl.placeholder = TRANSLATIONS[lang][''input_placeholder''];
        }

        // Update active dynamic elements if needed
        if (this.gameMode === ''timed'' && this.hintBtn) {
            const hintText = TRANSLATIONS[lang][''btn_hint''];
            this.hintBtn.innerText = `${hintText} (-5s)`;
        }
    }'

$content = [regex]::Replace($content, $pattern, $replacement)

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Output "Successfully fixed script.js"

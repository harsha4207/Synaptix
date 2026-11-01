$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$out = "C:\Users\Harsha MS\Synaptix\test_chrome.png"
$url = "data:text/html,<html><body style='background:white'><h1>Synaptix Test</h1></body></html>"
Start-Process -FilePath $chrome -ArgumentList @("--headless=new", "--disable-gpu", "--no-sandbox", "--window-size=1440,900", "--screenshot=$out", $url) -Wait
Test-Path $out


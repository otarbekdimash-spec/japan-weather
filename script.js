function showJapaneseName() {
    let name = document.getElementById("nameInput").value.trim();
    if (!name) name = "ゲスト";
    
    const katakana = {
        'а':'ア','б':'ブ','в':'ブ','г':'グ','д':'ド','е':'エ','ё':'ヨ',
        'ж':'ジ','з':'ズ','и':'イ','й':'イ','к':'ク','л':'ル','м':'ム',
        'н':'ン','о':'オ','п':'プ','р':'ル','с':'ス','т':'ト','у':'ウ',
        'ф':'フ','х':'フ','ц':'ツ','ч':'チ','ш':'シ','щ':'シュ','ы':'イ',
        'э':'エ','ю':'ユ','я':'ヤ',' ':' '
    };
    
    let result = "";
    for (let char of name.toLowerCase()) {
        result += katakana[char] || char.toUpperCase();
    }
    
    document.getElementById("japaneseName").textContent = result + "さん ようこそ！";
}
const fs = require('fs');
const archiver = require('archiver');

// const wyjatki = ['node_modules', '$RECYCLE.BIN', 'System Volume Information', '$Recycle.Bin', 'Config.Msi', 'Documents and Settings', 'Windows', 'AppData',
//'Program Files', 'Program Files (x86)', 'ProgramData', 'All Users', 'Default', 'Documents'];

const wyjatki = JSON.parse(fs.readFileSync(`${__dirname}/../wyjatki.json`));
 
// utils

exports.szukaj = function (dir, wzor) {
    szukajInt(dir, wzor);
}

var szukajInt = function (dir, wzor) {
    try {
        var list = fs.readdirSync(dir);
        list.forEach(function (file) {
            if (wyjatki.indexOf(file) === -1) {
            try {
                nazwa = dir + '/' + file;
                var stat = fs.statSync(nazwa);
                if (file === wzor) {
                    // console.log(`${nazwa} - ostatnia modyfikacja: ${stat.mtime.toLocaleDateString()} ${stat.mtime.toLocaleTimeString()}`);
                    CzyZnalazl = true;
                    sciezkaSzukaj = nazwa;
                    // Emitter.emit("nowaSprzedaz", "Michała");
                }
                if (stat && stat.isDirectory()) {
                    szukajInt(nazwa, wzor);
                }
            } catch (err) {
                console.log(`${nazwa} - brak dostępu!`);
            }
        }
        });      
    } catch (err) {
        console.log(`${nazwa} - brak dostępu!`);
    }
}

exports.sprawdzSciezke = function (sciezka, przeszukanie, wzor) { // sprawdzenie, czy scieżka istnieje, jeżeli nie, to wyszukiwany jest wzór od scięzki przeszukania
    try {
        fs.accessSync(sciezka, fs.constants.R_OK);
        // fs.statSync(sciezka);
        return sciezka;
    } catch (err) {
        console.log(`Scieżka ${sciezka} nie istnieje...`)
        CzyZnalazl = false;
        sciezkaSzukaj = '';
        if (przeszukanie === '') { // jeżeli przeszukanie = '' to przeszukuje wszystkie dyski C i D
            console.log('Przeszukuje dysk C:/...');
            szukajInt(`C:/`, wzor);
            if (sciezkaSzukaj ==='') {
                console.log('Przeszukuje dysk D:/...');
                szukajInt(`D:/`, wzor);
            }
        } else {
            console.log(`Przeszukuje ${przeszukanie}...`);
            szukajInt(przeszukanie, wzor);
        }
        return sciezkaSzukaj;        
    }
}

exports.archwizacja = async (katalogWejsciowy, plikWyjsciowy, callback) => {

    const output = fs.createWriteStream(`${process.cwd()}/${plikWyjsciowy}`);
    const archive = archiver('zip');

    output.on('close', () => {
        console.log(`archwizacja zakończona! ${plikWyjsciowy} utworzony (${archive.pointer()/1000000} MB)!`);
        callback(); // uruchamia callback dopiero po komunikacie o zakończeniu
    });

    archive.on('error', (err) => {
        return callback(new Error("błąd podczas archiwizacji"));
    });

    archive.pipe(output);
    // archive.directory(`${process.cwd()}/${katalogWejsciowy}`, '');
    // archive.glob(`${process.cwd()}/${katalogWejsciowy}/**`, {ignore: [`${process.cwd()}/${katalogWejsciowy}/node_modules/**`]});
    archive.glob(`${process.cwd()}/${katalogWejsciowy}/**`, {ignore: [`**/node_modules/**`]}); // ignoruje katalog node_modules
    console.log(`archiwizacja katalogu (${katalogWejsciowy})...`);
    // await archive.finalize();
    await archive.finalize();
}

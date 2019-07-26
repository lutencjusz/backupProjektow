const fs = require('fs');
// const archiver = require('archiver');
const dotenv = require('dotenv');
const {sprawdzSciezke, archwizacja} = require('./rekurencjaSzukania');

// zmienne 
var SCIEZKA_ENV = 'c:/data/node/cmd';
var SCIEZKA_DROPBOX_ARCH = '';
var CzyArchKatalog = false; // Czy archwizować katalog

// porównanie daty modyfikacji z teraz oraz process.env.ILE_GODZ_DO_ARCH
const porownajDaty = function (dP) {
    const d = Date.now();
    if (d - dP < process.env.ILE_GODZ_DO_ARCH * 60 * 60 * 1000) {
        return true
    } else {
        return false
    }
}
// funkcja rekurencyjna do wyszukiwania w katalogu modyfikowanych plików i jeżeli takie znajdzie ustawia CzyArchKatalo
var walk = function (dir) {
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        nazwa = dir + '/' + file;
        var stat = fs.statSync(nazwa);
        if (stat && stat.isDirectory() && file !== 'node_modules') {
            /* Recurse into a subdirectory */
            walk(nazwa);
        } else {
            if (porownajDaty(stat.mtimeMs)) {
                console.log(`${nazwa} - ostatnia modyfikacja: ${stat.mtime.toLocaleDateString()} ${stat.mtime.toLocaleTimeString()}`);
                CzyArchKatalog = true;
                // Emitter.emit("nowaSprzedaz", "Michała");
            }
        }
    });
    return CzyArchKatalog;
}

// głowny program

// ustawienie scieżki SCIEZKA_ENV
console.log(`Archiwizuje ${process.cwd()}`);
var p = sprawdzSciezke(SCIEZKA_ENV, '', 'cmd');
if (p !== '') {
    SCIEZKA_ENV = sprawdzSciezke(`${p}/config.env`, `${p}`, 'config.env');
}

if (SCIEZKA_ENV === '') {
    console.log('Bład scieżki SCIEZKA_ENV');
} else {
    console.log(`SCIEZKA_ENV: ${SCIEZKA_ENV}`);
}

const result = dotenv.config({
    path: `${SCIEZKA_ENV}`,
});
 
if (result.error) {
  throw result.error
} 

// ustawienie SCIEZKA_DROPBOX_ARCH
SCIEZKA_DROPBOX_ARCH = sprawdzSciezke(process.env.SCIEZKA_DROPBOX_ARCH, '', 'backup aplikacji')
if (SCIEZKA_DROPBOX_ARCH === '') {
    console.log('Bład scieżki SCIEZKA_DROPBOX_ARCH');
} else {
    console.log(`SCIEZKA_DROPBOX_ARCH: ${SCIEZKA_DROPBOX_ARCH}`);
}

// ustawienie daty odKiedy
var odKiedy = Date.now()-(process.env.ILE_GODZ_DO_ARCH*60*60*1000);
var d = new Date(odKiedy);

console.log(`Przeszukiwana ścieżka: ${process.cwd()}`);
console.log(`Pozuszukuję pliki modyfikowane poźniej niż: ${d.toLocaleDateString()} ${d.toLocaleTimeString()} (${process.env.ILE_GODZ_DO_ARCH}h)`);
console.log('------------------------------');
// process.chdir('..'); // ustawia katalog nadzrżedny, gdzie będą gromadzone .zip'y
// console.log(process.cwd());

// wyszukiwanie i archiwizowanie katalogów
fs.readdir(`${process.cwd()}`, (err, pliki) => {
    if (err) throw err
    pliki.forEach((plik) => {
        if (plik.search(/[.]/) === -1 && plik !== 'node_modules') { // sprawdza, czy został wykryty katalog i czy nie jest 
        CzyArchKatalog = false;// ustawia wstępną wartość
        walk(`${process.cwd()}/${plik}`);
        // console.log (`dla scieżki ${process.cwd()}/${plik} wartość jest w: ${w}, CzyArchKatalog: ${CzyArchKatalog}`)
        if  (CzyArchKatalog) {
            var stat = fs.statSync(`${process.cwd()}/${plik}`);
            var data = Date.now();
            var d = new Date(data);
            var m = d.getMonth()+1;
            var plikZip = `${plik}-${d.getFullYear()}${(m >= 10 ? m : "0" + m)}${d.getDate()}.zip`;
            // var plikZip = `${plik}-${stat.mtime.getFullYear()}${stat.mtime.getMonth()}${stat.mtime.getDate()}.zip`;
            archwizacja(`${plik}`, `${plikZip}`, (err) =>{
                if (err) throw err
                fs.stat(`${process.cwd()}/${plikZip}`, (err, stat) =>{
                    if (err) throw err
                    if (stat && !stat.isDirectory () && plik !== 'node_modules') { // sprawdza, czy został wykryty katalog i czy nie jest node_modules
                        fs.copyFile(`${process.cwd()}/${plikZip}`, `${SCIEZKA_DROPBOX_ARCH}/${plikZip}`, (err) => {
                            if (err) throw err;
                            console.log(`${plikZip} został przeniesiony z: ${process.cwd()} do: ${SCIEZKA_DROPBOX_ARCH}`);
                            fs.unlink(`${process.cwd()}/${plikZip}`, (err) => {
                                if (err) throw err;
                                console.log(`${plikZip} został usunięty z: ${process.cwd()}`);
                            }); 
                      });
                    } else {
                        console.log(`nie znaleziono pliku ${plik}.zip`);
                    };
                });
            });
            }
        }
    });
});

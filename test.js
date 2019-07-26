const fs = require('fs');
const dotenv = require('dotenv');

var SCIEZKA_DROPBOX_ARCHArch = 'C:/Users/michal.sobieraj/SCIEZKA_DROPBOX_ARCH/backup aplikacji';

// process.chdir('..');
// console.log(process.cwd());
var plik = 'cmd-2019624.zip';
var plik2 = 'cmd'
data = Date.now();
var d = new Date(data);
var m = d.getMonth();

var plikZip = `${plik2}-${d.getFullYear()}${(m >= 10 ? m : "0" + m)}${d.getDate()}.zip`;
// console.log(plikZip);


//--------------

const wyjatki = ['node_modules', '$RECYCLE.BIN', 'System Volume Information', '$Recycle.Bin', 'Config.Msi', 'Documents and Settings', 'Windows', 'AppData',
'Program Files', 'Program Files (x86)', 'ProgramData', 'All Users', 'Default', 'Documents'];

var szukaj = function (dir, wzor) {
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
                szukaj(nazwa, wzor);
            }
        } catch (err) {
            // console.log(`${nazwa} - brak dostępu`);
        }
    }
    });
}

var sprawdzSciezke = function (sciezka, przeszukanie, wzor) { // sprawdzenie, czy scieżka istnieje, jeżeli nie, to wyszukiwany jest wzór od scięzki przeszukania
    try {
        fs.statSync(sciezka);
        return sciezka;
    } catch (err) {
        CzyZnalazl = false;
        sciezkaSzukaj = '';
        if (przeszukanie === '') { // jeżeli przeszukanie = '' to przeszukuje wszystkie dyski C i D
            szukaj(`C:/`, wzor);
            szukaj(`D:/`, wzor);
        } else {
            szukaj(przeszukanie, wzor);
        }
        return sciezkaSzukaj;        
    }
}

console.log(JSON.parse(fs.readFileSync(`${__dirname}/wyjatki.json`)));

/*
var CzyZnalazl = false;
var sciezkaSzukaj = '';
//var szukam = 'backup aplikacji'
var szukam = 'cmd'
szukaj('D:/', szukam);
var szukam = 'config.env'
szukaj(sciezkaSzukaj, szukam);
if (CzyZnalazl) {
    console.log(`Znalazł: ${sciezkaSzukaj}`);
} else {
    console.log('Nie znalazł');
}
const result = dotenv.config({
    path: `${sciezkaSzukaj}`,
});
 
if (result.error) {
  throw result.error
}

console.log(process.env.WYJATKI.split(', ')[2]);
/*

var CzyZnalazl = false;
var sciezkaSzukaj = '';
var szukam = 'backup aplikacji'
szukaj('C:/', szukam);
szukaj('D:/', szukam);
console.log(CzyZnalazl, sciezkaSzukaj);
*/

// znajdz config.env
/*
var SCIEZKA_ENV = '';
var SCIEZKA_DROPBOX_ARCH = '';
var p = sprawdzSciezke('c:/data/node/cmd', '', 'cmd')
if (p !== '') {
    SCIEZKA_ENV = sprawdzSciezke(`${p}/config.env`, `${p}`, 'config.env');
}

if (SCIEZKA_ENV === '') {
    console.log('Bład scieżki SCIEZKA_ENV');
} else {
    console.log(`SCIEZKA_ENV: ${SCIEZKA_ENV}`);
}

//ustaw dotenv
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

// console.log('-------------spardzenie metody----------')
*/

/*
fs.copyFile(plik, `${SCIEZKA_DROPBOX_ARCHArch}/${plik}`, (err) => {
    if (err) throw err;
    console.log(`${plik} został przekopiowany z: ${process.cwd()} do: ${SCIEZKA_DROPBOX_ARCHArch}`);
  });
*/
/*
fs.readdir(`${process.cwd()}`, (err, pliki) => {
   if (err) throw err
   pliki.forEach((plik) => {
        if (plik.search(/zip\b/) !== -1){
            var stat = fs.statSync(`${process.cwd()}/${plik}`);
            if (stat && !stat.isDirectory () && plik !== 'node_modules') { // sprawdza, czy został wykryty katalog i czy nie jest node_modules
                fs.copyFile(`${process.cwd()}/${plik}`, `${SCIEZKA_DROPBOX_ARCHArch}/${plik}`, (err) => {
                    if (err) throw err;
                    console.log(`${plik} został przeniesiony z: ${process.cwd()} do: ${SCIEZKA_DROPBOX_ARCHArch}`);
                    fs.unlink(`${process.cwd()}/${plik}`, (err) => {
                        if (err) throw err;
                        console.log(`${plik} został usunięty z: ${process.cwd()}`);
                    }); 
              });
            };
        }

   }
)});
*/
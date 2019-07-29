const fs = require('fs');
// const archiver = require('archiver');
const dotenv = require('dotenv');
const progress = require('progress');
const finder = require('fs-finder');
const {archwizacja} = require(`${__dirname}/utils/rekurencjaSzukania`);
const events = require("events");

// zmienne 
var SCIEZKA_ENV = 'c:/data/node/cmd';
var SCIEZKA_DROPBOX_ARCH = '';
var CzyArchKatalog = false; // Czy archwizować katalog
const wyjatki = JSON.parse(fs.readFileSync(`${__dirname}/wyjatki.json`));

class Sygnal extends events {
    constructor() {
        super();
    }
}

const Emitter = new Sygnal();



// porównanie daty modyfikacji z teraz oraz process.env.ILE_GODZ_DO_ARCH
const porownajDaty = function (dP) {
    const d = Date.now();
    if (d - dP < process.env.ILE_GODZ_DO_ARCH * 60 * 60 * 1000) {
        return true
    } else {
        return false
    }
}

const walk = function (dir) {
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
// funkcja rekurencyjna do wyszukiwania w katalogu modyfikowanych plików i jeżeli takie znajdzie ustawia CzyArchKatalog

const szukajDropbox = function () {
    console.log(`Znaleziono config.env na ${SCIEZKA_ENV}!`)
    const result = dotenv.config({
        path: `${SCIEZKA_ENV}`
    });
    fs.access(process.env.SCIEZKA_DROPBOX_ARCH, fs.constants.R_OK, (err)=>{
        if (err) {
            var bar = new progress('Szukam SCIEZKA_DROPBOX_ARCH :percent [:bar]',  {
                total: 100, 
                complete: '=',
                incomplete: ' ' 
            });
            var timer = setInterval(function () {
                bar.tick(1);
                if (bar.complete) {
                  clearInterval(timer);
                };
            }, 600);
            console.log(`Nie znaleziono backup aplikacji na ${process.env.SCIEZKA_DROPBOX_ARCH}, szukam na c:/...`);
            finder.from('C:/Users/').exclude(wyjatki).findDirectories('backup aplikacji', (dirs) => {
                if (!dirs[0]){
                    console.log(`Nie znaleziono na C:/ szukam na D:/...`);
                    finder.from('D:/Users/').exclude(wyjatki).findDirectories('backup aplikacji', (dirs) => {
                        if (!dirs[0]){
                            throw new Error(`Nie znaleziono config.env`);
                        } else {
                            SCIEZKA_DROPBOX_ARCH = dirs[0];
                            bar.update(1);
                            Emitter.emit('ZmiennePrzydzielone');
                        }
                    })
                } else {
                    SCIEZKA_DROPBOX_ARCH = dirs[0];
                    bar.update(1);
                    Emitter.emit('ZmiennePrzydzielone');
                }
            });
        } else {
            SCIEZKA_DROPBOX_ARCH = process.env.SCIEZKA_DROPBOX_ARCH;
            Emitter.emit('ZmiennePrzydzielone');
        }
    });
}

// głowny program

// ustawienie scieżki SCIEZKA_ENV
    SCIEZKA_ENV = 'd:/data/node/cmd/config.env';
    console.log(`Sprawdzam scieżkę ${SCIEZKA_ENV} dla SCIEZKA_ENV`);
    var bar = new progress('Szukam SCIEZKA_ENV :percent [:bar]',  {
        total: 100, 
        complete: '=',
        incomplete: ' ' 
    });
    var timer = setInterval(function () {
        bar.tick(1);
        if (bar.complete) {
          clearInterval(timer);
        };
    }, 500);

        try{
            finder.from('c:/data/node/').exclude(wyjatki).findFirst().findFiles('config.env', (file) => {
                SCIEZKA_ENV = file;
                bar.update(1);
                szukajDropbox();
            });
        } catch (err){
            try {
                console.log(`Nie znaleziono config.env, szukam na d:/`);
                finder.from('d:/data/node/').exclude(wyjatki).findFirst().findFiles('config.env', (file) => {
                    SCIEZKA_ENV = file;
                    bar.update(1);
                    szukajDropbox();
                });
            } catch (err2){
                throw new Error(`Nie znaleziono config.env`);
            }
        }

 
Emitter.on ('ZmiennePrzydzielone', () => {
    console.log(`SCIEZKA_ENV: ${SCIEZKA_ENV}`);
    console.log(`SCIEZKA_DROPBOX_ARCH: ${SCIEZKA_DROPBOX_ARCH}`);

    // ustawienie daty odKiedy
    var odKiedy = Date.now()-(process.env.ILE_GODZ_DO_ARCH*60*60*1000);
    var d = new Date(odKiedy);

    console.log(`Przeszukiwana ścieżka: ${process.cwd()}`);
    console.log(`Pozuszukuję pliki modyfikowane poźniej niż: ${d.toLocaleDateString()} ${d.toLocaleTimeString()} (${process.env.ILE_GODZ_DO_ARCH}h)\n`);
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
                const bar = new progress(':nazwaPliku :percent :postep MB [:bar]',  {
                    total: 50, 
                    complete: '=',
                    incomplete: ' ' 
                });
                archwizacja(`${plik}`, `${plikZip}`, bar, (err) =>{
                    if (err) throw err
                    fs.stat(`${process.cwd()}/${plikZip}`, (err, stat) =>{
                        if (err) throw err
                        if (stat && !stat.isDirectory () && plik !== 'node_modules') { // sprawdza, czy został wykryty katalog i czy nie jest node_modules
                            fs.copyFile(`${process.cwd()}/${plikZip}`, `${SCIEZKA_DROPBOX_ARCH}/${plikZip}`, (err) => {
                                if (err) throw err;
                                if (bar.complete) {
                                    console.log(`${plikZip} został przeniesiony z: ${process.cwd()} do: ${SCIEZKA_DROPBOX_ARCH}`);
                                } else {
                                    bar.interrupt(`${plikZip} został przeniesiony z: ${process.cwd()} do: ${SCIEZKA_DROPBOX_ARCH}`)
                                }
                                fs.unlink(`${process.cwd()}/${plikZip}`, (err) => {
                                    if (err) throw err;
                                    if (bar.complete){
                                        console.log(`${plikZip} został usunięty z: ${process.cwd()}`);
                                    } else {
                                        bar.interrupt(`${plikZip} został usunięty z: ${process.cwd()}`)
                                    }                                
                                }); 
                        });
                        } else {
                            // console.log(`nie znaleziono pliku ${plik}.zip`);
                            bar.interrupt(`nie znaleziono pliku ${plik}.zip`)
                        };
                    });
                });
                }
            }
        });
    });
});

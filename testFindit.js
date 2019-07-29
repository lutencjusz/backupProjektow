const fs = require('fs');
const dotenv = require('dotenv');
const finder = require('fs-finder');
const events = require("events");
const progressBar = require('progress');

const wyjatki = ['node_modules', '$RECYCLE.BIN', 'System Volume Information', '$Recycle.Bin', 'Config.Msi', 'Documents and Settings', 'Windows', 'AppData',
'Program Files', 'Program Files (x86)', 'ProgramData', 'All Users', 'Default', 'Documents'];

class Sygnal extends events {
    constructor() {
        super();
    }
}

const Emitter = new Sygnal();

/*
finder.from('C:/data/node/').exclude(wyjatki).findFiles('config.env', (files) => {
    console.log(files[0]);
});


start = Date.now();
Finder.from('C:/').exclude(wyjatki).findDirectories('backup aplikacji', (dir) => {
    console.log(dir[0], (Date.now()-start)/(60*1000));
});
start = Date.now();
Finder.from('C:/').exclude(wyjatki2).findDirectories('backup aplikacji', (dir) => {
    console.log(dir[0], (Date.now()-start)/(60*1000));
});
start = Date.now();
Finder.from('C:/').findDirectories('backup aplikacji', (dir) => {
    console.log(dir[0], (Date.now()-start)/(60*1000));
});


(async () => {
        SCIEZKA_ENV = 'd:/data/node/cmd/config.env';
        console.log(`Sprawdzam scieżkę ${SCIEZKA_ENV} dla SCIEZKA_ENV`);
        var bar = new progressBar(':bar',  {
            total: 100, 
            complete: '.',
            incomplete: ' ' 
        });
        var timer = setInterval(function () {
            bar.tick(1);
            if (bar.complete) {
              clearInterval(timer);
            };
        }, 500);
        finder.from('C:/data/node/').exclude(wyjatki).findFiles('config.env', (files) => {
            if (!files[0]){
                console.log(`Nie znaleziono config.env, szukam na d:/`);
                finder.from('d:/data/node/').exclude(wyjatki).findFiles('config.env', (files) => {
                    if (!files[0]){
                        throw new Error(`Nie znaleziono config.env`);
                    } else {
                        SCIEZKA_ENV = files[0];
                        bar.update(1);
                    }
                })
            } else {
                SCIEZKA_ENV = files[0];
                bar.update(1);
            }
            console.log(`Znaleziono config.env na ${SCIEZKA_ENV}!`)
            const result = dotenv.config({
                path: `${SCIEZKA_ENV}`
            });
            fs.access(process.env.SCIEZKA_DROPBOX_ARCH, fs.constants.R_OK, (err)=>{
                if (err) {
                    var bar = new progressBar(':bar',  {
                        total: 100, 
                        complete: '.',
                        incomplete: ' ' 
                    });
                    var timer = setInterval(function () {
                        bar.tick(1);
                        if (bar.complete) {
                          clearInterval(timer);
                        };
                    }, 500);
                    console.log(`Nie znaleziono backup aplikacji na ${process.env.SCIEZKA_DROPBOX_ARCH}, szukam na c:/...`);
                    finder.from('C:/').exclude(wyjatki).findDirectories('backup aplikacji', (dirs) => {
                        if (!dirs[0]){
                            console.log(`Nie znaleziono na C:/ szukam na D:/...`);
                            finder.from('D:/').exclude(wyjatki).findDirectories('backup aplikacji', (dirs) => {
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
                    bar.update(1);
                    Emitter.emit('ZmiennePrzydzielone');
                }
            });
        });
})();

Emitter.on ('ZmiennePrzydzielone', () => {
    console.log('\nPodsumowanie:');
    console.log(`SCIEZKA_ENV: ${SCIEZKA_ENV}`);
    console.log(`SCIEZKA_DROPBOX_ARCH: ${SCIEZKA_DROPBOX_ARCH}`);
});
*/
try{
    finder.from('c:/data/').exclude(wyjatki).findFirst().findFiles('config.env', (files) => {
        if (files.length === 0) throw new Error('oops');;
        console.log(files);
    })
} catch (err){
    console.log('błąd');
    /*
    try {
        finder.from('d:/data/').exclude(wyjatki).findFirst().findFiles('config.env', (files) => {
            console.log(files);
        });
    } catch (err){
        throw new Error(`Nie znaleziono config.env`);
    }*/
}

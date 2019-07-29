const fs = require('fs');
const archiver = require('archiver');
const finder = require('fs-finder');

// const wyjatki = ['node_modules', '$RECYCLE.BIN', 'System Volume Information', '$Recycle.Bin', 'Config.Msi', 'Documents and Settings', 'Windows', 'AppData',
//'Program Files', 'Program Files (x86)', 'ProgramData', 'All Users', 'Default', 'Documents'];

const wyjatki = JSON.parse(fs.readFileSync(`${__dirname}/../wyjatki.json`));

// utils

exports.sprawdzSciezke = function (sciezka, przeszukanie, wzor) { // sprawdzenie, czy scieżka istnieje, jeżeli nie, to wyszukiwany jest wzór od scięzki przeszukania
    try {
        fs.access(sciezka, fs.constants.R_OK, (err)=>{
            if (err) throw err;
            return sciezka;
        });
    } catch (err) {
        console.log(`Scieżka ${sciezka} nie istnieje...`)
        CzyZnalazl = false;
        sciezkaSzukaj = '';
        if (przeszukanie === '') { // jeżeli przeszukanie = '' to przeszukuje wszystkie dyski C i D
            console.log('Przeszukuje dysk C:/...');
            //szukajInt(`C:/`, wzor);
            finder.from('C:/').exclude(wyjatki).findDirectories(wzor, (dir) => {
                if (dir[0]){
                    console.log('Przeszukuje dysk D:/...');
                    finder.from('D:/').exclude(wyjatki).findDirectories(wzor, (dir) => {
                        if (dir[0]){
                            sciezkaSzukaj = dir[0];
                            CzyZnalazl = true;
                        }
                    });
                }
            })
        } else {
            console.log(`Przeszukuje ${przeszukanie}...`);
            finder.from(przeszukanie).exclude(wyjatki).findDirectories(wzor, (dir) => {
                if (dir[0]){
                    sciezkaSzukaj = dir[0];
                    CzyZnalazl = true;
                }
            });
        }
        return sciezkaSzukaj;        
    }
}

exports.archwizacja = async (katalogWejsciowy, plikWyjsciowy, pasekPostepu, callback) => {

    const output = fs.createWriteStream(`${process.cwd()}/${plikWyjsciowy}`);
    const archive = archiver('zip');

    output.on('close', () => {
        pasekPostepu.update(1, {
            'postep': archive.pointer()/1000000,
            'nazwaPliku': plikWyjsciowy
        }); 
        clearInterval(timer);
        // console.log(`archwizacja zakończona! ${plikWyjsciowy} utworzony (${archive.pointer()/1000000} MB)!`);
        // pasekPostepu.interrupt(`archwizacja zakończona! ${plikWyjsciowy} utworzony (${archive.pointer()/1000000} MB)!`);
        callback(); // uruchamia callback dopiero po komunikacie o zakończeniu
    });

    archive.on('error', (err) => {
        return callback(new Error("błąd podczas archiwizacji"));
    });

    archive.pipe(output);
    // archive.directory(`${process.cwd()}/${katalogWejsciowy}`, '');
    // archive.glob(`${process.cwd()}/${katalogWejsciowy}/**`, {ignore: [`${process.cwd()}/${katalogWejsciowy}/node_modules/**`]});
    archive.glob(`${process.cwd()}/${katalogWejsciowy}/**`, {ignore: [`**/node_modules/**`]}); // ignoruje katalog node_modules
 
    // console.log(`archiwizacja katalogu (${katalogWejsciowy})...`);
    const timer = setInterval(function () {
        pasekPostepu.tick(1, {
            'postep': archive.pointer()/1000000,
            'nazwaPliku': plikWyjsciowy
        });
        if (pasekPostepu.complete) {
          clearInterval(timer);
        };
      }, 300);
      pasekPostepu.interrupt(`archiwizacja katalogu (${katalogWejsciowy})...`);
    archive.finalize();
}

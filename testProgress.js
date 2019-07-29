/*
var total = 50000,
    count = 0,
    pace = require('pace')(total);

while (count++ < total) {
  pace.op();

  // Cause some work to be done.
  for (var i = 0; i < 1000000; i++) {
    count = count;
    // if (count%1000 === 0) console.log('pokazuje komentarz')
  }
}
*/

var ProgressBar = require('progress');

var bar = new ProgressBar(':current% :postep :bar',  {
    total: 100, 
    complete: '.',
    incomplete: ' ' 
});
var timer = setInterval(function () {
  bar.tick(2, {
      'postep' : bar.curr
  });
  if (bar.complete) {
    console.log('\nzakończono\n');
    clearInterval(timer);
  };
  // if (bar.curr > 50) bar.interrupt(`aktualny postęp wynosi: ${bar.curr}/${bar.total}`);
  if (bar.curr > 20) {
      bar.update(1, {
        'postep' : 100
      }); // ustawia na 100%
      console.log('\nzakończono\n');
      clearInterval(timer);
  }
}, 100);
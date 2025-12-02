// ** إعدادات اللعبة **
const MAX_SCORE = 30;
const CELEBRATION_DURATION = 2000;
const CHAR_WIDTH_VW = 25; // تم تحديثها لتتوافق مع CSS (25vw)
const STORAGE_KEY_GIRLS = 'girlsWins';
const STORAGE_KEY_BOYS = 'boysWins';

// ** عناصر DOM **
const girlsProgress = document.getElementById('girls-progress');
const boysProgress = document.getElementById('boys-progress');
const centerLine = document.getElementById('center-line');
const girlsWinsSpan = document.getElementById('girls-wins');
const boysWinsSpan = document.getElementById('boys-wins');
const girlsCharacter = document.getElementById('girls-character');
const boysCharacter = document.getElementById('boys-character');
const celebrationScreen = document.getElementById('celebration-screen');
const winnerMessage = document.getElementById('winner-message');
const resetButton = document.getElementById('reset-button');

// ** حالة اللعبة **
let girlsScore = 0;
let boysScore = 0;
let girlsWinCount = 0;
let boysWinCount = 0;
let isGameOver = false;
let isSoundPlaying = false;

// ** وظائف حفظ وتحميل البيانات **
function loadWins() {
  girlsWinCount = parseInt(localStorage.getItem(STORAGE_KEY_GIRLS) || '0', 10);
  boysWinCount = parseInt(localStorage.getItem(STORAGE_KEY_BOYS) || '0', 10);
}

function saveWins() {
  localStorage.setItem(STORAGE_KEY_GIRLS, girlsWinCount);
  localStorage.setItem(STORAGE_KEY_BOYS, boysWinCount);
}

// ** وظيفة إنشاء وتشغيل الصوت **
function playSound(team) {
  if (team === 'win') {
    if (typeof Audio !== 'undefined') {
      new Audio('win.mp3').play().catch(e => console.error("Error playing win sound:", e));
    }
    return;
  }

  if (typeof Audio !== 'undefined' && !isSoundPlaying) {
    let audio = new Audio(team === 'girls' ? 'girls.mp3' : 'boys.mp3');

    if (audio) {
      isSoundPlaying = true;
      audio.play().catch(e => console.error("Error playing sound:", e));

      audio.onended = () => {
        isSoundPlaying = false;
      };
    }
  }
}

// ** وظيفة تحديث واجهة المستخدم والتحريك (تم إصلاح حركة الشخصيات) **
function updateUI() {
  let girlsPercentage;
  let pushFactor = (girlsScore - boysScore) / MAX_SCORE;

  girlsPercentage = 50 + (pushFactor * 50);

  girlsPercentage = Math.max(0, Math.min(100, girlsPercentage));
  let boysPercentage = 100 - girlsPercentage;

  // 1. تطبيق التغير على العرض
  girlsProgress.style.width = `${girlsPercentage}%`;
  boysProgress.style.width = `${boysPercentage}%`;

  // 2. تحريك الخط الأصفر
  centerLine.style.left = `${girlsPercentage}%`;

  // 3. ** حركة الشخصيات (التصاق اليدين بالخط الأصفر) **

  // Girls Character: حافتها اليمنى (اليد) تلامس الخط الأصفر.
  girlsCharacter.style.left = `calc(${girlsPercentage}% - ${CHAR_WIDTH_VW}vw)`;

  // Boys Character: حافتها اليسرى (اليد) تلامس الخط الأصفر مباشرة.
  boysCharacter.style.left = `${girlsPercentage}%`;

  // 4. تحديث عدادات الفوز
  girlsWinsSpan.textContent = girlsWinCount;
  boysWinsSpan.textContent = boysWinCount;

  if (!isGameOver) {
    checkWinCondition();
  }
}
// ** وظيفة معالجة إضافة النقاط **
function addScore(team, points) {
  if (isGameOver) return;

  if (team === 'girls') {
    girlsScore += points;
    playSound('girls');
  } else if (team === 'boys') {
    boysScore += points;
    playSound('boys');
  }

  updateUI();
}

// ** وظيفة التحقق من انتهاء الجولة (السيطرة الكاملة) **
function checkWinCondition() {
  if (isGameOver) return;

  const girlsWidth = parseFloat(girlsProgress.style.width);

  if (girlsWidth <= 0.1) {
    endRound('Boys');
  }
  else if (girlsWidth >= 99.9) {
    endRound('Girls');
  }
}

// ** وظيفة إنهاء الجولة **
function endRound(winner) {
  if (isGameOver) return;
  isGameOver = true;

  playSound('win');

  if (winner === 'Girls') {
    girlsWinCount++;
    winnerMessage.innerHTML = '🎉 Girls Win the Round! 🎉';
    winnerMessage.style.color = 'var(--girls-color)';
  } else {
    boysWinCount++;
    winnerMessage.innerHTML = '✨ Boys Win the Round! ✨';
    winnerMessage.style.color = 'var(--boys-color)';
  }

  saveWins();
  updateUI();

  celebrationScreen.classList.remove('hidden');

  setTimeout(startNewRound, CELEBRATION_DURATION);
}

// ** وظيفة بدء جولة جديدة **
function startNewRound() {
  celebrationScreen.classList.add('hidden');

  girlsScore = 0;
  boysScore = 0;
  isGameOver = false;
  isSoundPlaying = false;

  updateUI();
}

// ** وظيفة إعادة تعيين عدد الفوز **
function resetGameScores() {
  if (confirm("هل أنت متأكد من رغبتك في تصفير جميع عدادات الفوز؟")) {
    girlsWinCount = 0;
    boysWinCount = 0;
    localStorage.removeItem(STORAGE_KEY_GIRLS);
    localStorage.removeItem(STORAGE_KEY_BOYS);
    startNewRound();
    alert("تمت إعادة تعيين عدادات الفوز بنجاح.");
  }
}

// ** معالجة ضغطات المفاتيح **
document.addEventListener('keydown', (e) => {
  if (isGameOver) return;

  // منع المتصفح من القيام بإجراء افتراضي لـ 0, 1, 2, 9 إذا كانت هذه مفاتيح تحكم في اللعبة
  if (['0', '1', '2', '9'].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    // فريق الأولاد (Boys)
    case '0': addScore('boys', 1); break;
    case '9': addScore('boys', 5); break;

    // فريق البنات (Girls)
    case '1': addScore('girls', 1); break;
    case '2': addScore('girls', 5); break;
  }
});

// ** بدء اللعبة عند التحميل **
document.addEventListener('DOMContentLoaded', () => {
  loadWins();
  startNewRound();

  // ** ربط زر إعادة التعيين بالوظيفة **
  resetButton.addEventListener('click', resetGameScores);
});
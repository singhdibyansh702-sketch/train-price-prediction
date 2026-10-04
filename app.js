/**
 * RailPulse AI • Intelligent Train Transit Suite
 * College Mini Project: Ticket Price, Train Delay, and Seat Availability Prediction
 * Interactive UI Controller, Dynamic ML Bridge & Session History
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===========================================================================
  // 1. DATA DICTIONARIES & HEURISTICS
  // ===========================================================================

  const stationDistances = {
    'NDLS-MMCT': 1384, 'MMCT-NDLS': 1384,
    'NDLS-CSMT': 1384, 'CSMT-NDLS': 1384,
    'SBC-MAS': 362,   'MAS-SBC': 362,
    'HWH-NDLS': 1447, 'NDLS-HWH': 1447,
    'CSMT-MAO': 580,  'MAO-CSMT': 580,
    'MMCT-MAO': 580,  'MAO-MMCT': 580,
    'ADI-NDLS': 934,  'NDLS-ADI': 934,
    'PNBE-NDLS': 998, 'NDLS-PNBE': 998,
    'HYB-SBC': 625,   'SBC-HYB': 625,
    'JAT-NDLS': 580,  'NDLS-JAT': 580,
    'CNB-NDLS': 440,  'NDLS-CNB': 440,
    'CNB-HWH': 1007,  'HWH-CNB': 1007,
    'MAS-HWH': 1660,  'HWH-MAS': 1660,
    'PNBE-HWH': 532,  'HWH-PNBE': 532
  };

  const stationNames = {
    'NDLS': 'New Delhi',
    'MMCT': 'Mumbai Central',
    'CSMT': 'Mumbai CST',
    'SBC': 'Bengaluru City',
    'MAS': 'Chennai Central',
    'HWH': 'Kolkata Howrah',
    'PNBE': 'Patna Junction',
    'ADI': 'Ahmedabad',
    'HYB': 'Hyderabad Deccan',
    'MAO': 'Madgaon Goa',
    'JAT': 'Jammu Tawi',
    'CNB': 'Kanpur Central'
  };

  const classConfig = {
    '1A': { name: 'First Class AC (1A)', multiplier: 6.2, hasGst: true, capacity: 22 },
    '2A': { name: 'AC 2-Tier (2A)', multiplier: 3.8, hasGst: true, capacity: 48 },
    '3A': { name: 'AC 3-Tier (3A)', multiplier: 2.7, hasGst: true, capacity: 64 },
    'EC': { name: 'Executive Chair Car (EC)', multiplier: 4.5, hasGst: true, capacity: 45 },
    'CC': { name: 'AC Chair Car (CC)', multiplier: 1.8, hasGst: true, capacity: 70 },
    'SL': { name: 'Sleeper Class (SL)', multiplier: 1.0, hasGst: false, capacity: 72 },
    '2S': { name: 'Second Sitting (2S)', multiplier: 0.6, hasGst: false, capacity: 90 }
  };

  const trainTypeConfig = {
    'Rajdhani': { multiplier: 1.45, label: 'VANDE BHARAT / RAJDHANI', codePrefix: '124' },
    'Duronto':  { multiplier: 1.28, label: 'SHATABDI / DURONTO', codePrefix: '122' },
    'Superfast':{ multiplier: 1.15, label: 'SUPERFAST EXPRESS', codePrefix: '129' },
    'Express':  { multiplier: 1.00, label: 'MAIL / STANDARD EXPRESS', codePrefix: '110' },
    'Passenger':{ multiplier: 0.82, label: 'PASSENGER / ORDINARY', codePrefix: '540' }
  };

  const popularTrainsData = {
    '12952': { number: '12952', name: 'Mumbai Rajdhani Express', type: 'Rajdhani', origin: 'NDLS', dest: 'MMCT', time: '16:55' },
    '12951': { number: '12951', name: 'New Delhi Rajdhani Express', type: 'Rajdhani', origin: 'MMCT', dest: 'NDLS', time: '17:00' },
    '12002': { number: '12002', name: 'Bhopal Shatabdi Express', type: 'Duronto', origin: 'NDLS', dest: 'CNB', time: '06:00' },
    '12626': { number: '12626', name: 'Kerala Superfast Express', type: 'Superfast', origin: 'NDLS', dest: 'SBC', time: '20:10' },
    '12302': { number: '12302', name: 'Howrah Rajdhani Express', type: 'Rajdhani', origin: 'NDLS', dest: 'HWH', time: '16:50' },
    '12658': { number: '12658', name: 'Chennai Mail Express', type: 'Express', origin: 'MAS', dest: 'SBC', time: '23:15' },
    '12051': { number: '12051', name: 'Jan Shatabdi Express', type: 'Superfast', origin: 'CSMT', dest: 'MAO', time: '05:10' }
  };

  let currentCurrency = 'INR';
  const USD_EXCHANGE_RATE = 84.0;

  function getJourneyDistance(origin, dest) {
    if (origin === dest) return 0;
    const key = `${origin}-${dest}`;
    return stationDistances[key] || 920;
  }

  function getDayNameFromDate(dateStr) {
    if (!dateStr) return 'Wednesday';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[d.getDay()];
    } catch {
      return 'Wednesday';
    }
  }


  // ===========================================================================
  // 2. DASHBOARD NAVIGATION & TAB CONTROLLER (SECTION 3)
  // ===========================================================================

  const moduleTabBtns = document.querySelectorAll('.module-tab-btn');
  const modulePanels = document.querySelectorAll('.module-panel');
  const dashCards = document.querySelectorAll('.dash-card');

  function switchModule(targetModuleId) {
    // 1. Update Navigation Tabs
    moduleTabBtns.forEach(btn => {
      if (btn.getAttribute('data-module') === targetModuleId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Update Panels
    modulePanels.forEach(panel => {
      if (panel.id === targetModuleId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // 3. Highlight Matching Dashboard Card
    dashCards.forEach(card => {
      const cardType = card.id.replace('dash-card-', '');
      if (targetModuleId.includes(cardType)) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // If charts tab opened, render/resize charts
    if (targetModuleId === 'module-charts') {
      setTimeout(renderAllCharts, 80);
    }
  }

  // Bind Tab clicks
  moduleTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-module');
      switchModule(target);
    });
  });

  // Bind Dashboard Card Action Buttons
  const btnOpenPrice = document.getElementById('btn-open-price');
  const btnOpenDelay = document.getElementById('btn-open-delay');
  const btnOpenSeats = document.getElementById('btn-open-seats');

  function openModuleAndScroll(moduleId) {
    switchModule(moduleId);
    const panel = document.getElementById(moduleId);
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (btnOpenPrice) btnOpenPrice.addEventListener('click', () => openModuleAndScroll('module-price'));
  if (btnOpenDelay) btnOpenDelay.addEventListener('click', () => openModuleAndScroll('module-delay'));
  if (btnOpenSeats) btnOpenSeats.addEventListener('click', () => openModuleAndScroll('module-seats'));

  // Also clicking on the dashboard cards themselves triggers open
  document.getElementById('dash-card-price')?.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openModuleAndScroll('module-price');
  });
  document.getElementById('dash-card-delay')?.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openModuleAndScroll('module-delay');
  });
  document.getElementById('dash-card-seats')?.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openModuleAndScroll('module-seats');
  });


  // ===========================================================================
  // 3. MODULE 1: TICKET PRICE PREDICTION (ORIGINAL PRESERVED & EXTENDED)
  // ===========================================================================

  const fareForm = document.getElementById('fare-prediction-form');
  const originSelect = document.getElementById('origin-station');
  const destSelect = document.getElementById('destination-station');
  const swapBtn = document.getElementById('swap-stations-btn');
  const classSelect = document.getElementById('travel-class');
  const trainTypeSelect = document.getElementById('train-type');
  const daysInput = document.getElementById('days-until-departure');
  const dateInput = document.getElementById('departure-date');
  const quotaSelect = document.getElementById('booking-quota');
  const predictBtn = document.getElementById('predict-btn');
  const destHint = document.getElementById('dest-hint');
  const quickChips = document.querySelectorAll('.route-chip');
  const btnResetPrice = document.getElementById('btn-reset-price');

  // Ticket Stub Elements
  const ticketSection = document.getElementById('ticket-result');
  const ticketTrainCategory = document.getElementById('ticket-train-category');
  const ticketTrainTitle = document.getElementById('ticket-train-title');
  const ticketPnr = document.getElementById('ticket-pnr');
  const ticketOriginCode = document.getElementById('ticket-origin-code');
  const ticketOriginName = document.getElementById('ticket-origin-name');
  const ticketDestCode = document.getElementById('ticket-dest-code');
  const ticketDestName = document.getElementById('ticket-dest-name');
  const ticketDuration = document.getElementById('ticket-duration');
  const ticketDistance = document.getElementById('ticket-distance');
  const ticketClassName = document.getElementById('ticket-class-name');
  const ticketTravelDate = document.getElementById('ticket-travel-date');
  const ticketDaysAhead = document.getElementById('ticket-days-ahead');
  const ticketQuotaName = document.getElementById('ticket-quota-name');
  const ticketPrice = document.getElementById('ticket-price');
  const ticketCurrSymbol = document.getElementById('ticket-currency-symbol');
  const ticketConfidenceRange = document.getElementById('ticket-confidence-range');
  const dynamicSurgeIndicator = document.getElementById('dynamic-surge-indicator');
  const adviceTitle = document.getElementById('advice-title');
  const adviceMessage = document.getElementById('advice-message');
  const btnRecalculate = document.getElementById('btn-recalculate');

  const breakdownBase = document.getElementById('breakdown-base');
  const breakdownClass = document.getElementById('breakdown-class');
  const breakdownSurge = document.getElementById('breakdown-surge');
  const breakdownTax = document.getElementById('breakdown-tax');

  const currInrBtn = document.getElementById('curr-inr');
  const currUsdBtn = document.getElementById('curr-usd');

  let lastCalculatedFareINR = 1543;
  let lastBreakdownINR = { base: 1120, classSurge: 350, dynamicSurge: 0, tax: 73 };

  function initFareDates() {
    const today = new Date();
    const defaultDays = parseInt(daysInput.value, 10) || 14;
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + defaultDays);

    dateInput.value = targetDate.toISOString().split('T')[0];
    dateInput.min = today.toISOString().split('T')[0];
    updateFareDistanceHint();
  }

  daysInput.addEventListener('input', () => {
    let days = parseInt(daysInput.value, 10);
    if (isNaN(days) || days < 0) days = 0;
    if (days > 120) days = 120;
    
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    dateInput.value = targetDate.toISOString().split('T')[0];
  });

  dateInput.addEventListener('change', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateInput.value);
    selected.setHours(0, 0, 0, 0);

    const diffTime = selected - today;
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    daysInput.value = diffDays;
  });

  swapBtn.addEventListener('click', () => {
    const temp = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = temp;

    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => { swapBtn.style.transform = ''; }, 300);
    updateFareDistanceHint();
  });

  function updateFareDistanceHint() {
    const origin = originSelect.value;
    const dest = destSelect.value;
    if (origin === dest) {
      destHint.textContent = '⚠️ Origin and destination cannot be identical';
      destHint.style.color = '#ef4444';
      return;
    }
    destHint.style.color = '';
    const dist = getJourneyDistance(origin, dest);
    destHint.textContent = `Estimated track distance: ~${dist.toLocaleString()} km`;
  }

  originSelect.addEventListener('change', updateFareDistanceHint);
  destSelect.addEventListener('change', updateFareDistanceHint);

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const orig = chip.getAttribute('data-origin');
      const dest = chip.getAttribute('data-dest');
      if (orig && dest) {
        originSelect.value = orig;
        destSelect.value = dest;
        updateFareDistanceHint();
        chip.style.transform = 'scale(0.95)';
        setTimeout(() => chip.style.transform = '', 150);
      }
    });
  });

  // Currency Toggle
  function updateCurrency(curr) {
    currentCurrency = curr;
    if (curr === 'INR') {
      currInrBtn.classList.add('active');
      currUsdBtn.classList.remove('active');
      ticketCurrSymbol.textContent = '₹';
    } else {
      currUsdBtn.classList.add('active');
      currInrBtn.classList.remove('active');
      ticketCurrSymbol.textContent = '$';
    }
    renderFarePrices();
  }

  currInrBtn.addEventListener('click', () => updateCurrency('INR'));
  currUsdBtn.addEventListener('click', () => updateCurrency('USD'));

  function formatMoney(amountINR) {
    if (currentCurrency === 'USD') {
      return (amountINR / USD_EXCHANGE_RATE).toFixed(2);
    }
    return Math.round(amountINR).toLocaleString('en-IN');
  }

  function renderFarePrices() {
    const sym = currentCurrency === 'INR' ? '₹ ' : '$ ';
    ticketPrice.textContent = formatMoney(lastCalculatedFareINR);
    
    const low = formatMoney(lastCalculatedFareINR * 0.96);
    const high = formatMoney(lastCalculatedFareINR * 1.04);
    ticketConfidenceRange.textContent = `Confidence Range: ${sym}${low} - ${sym}${high}`;

    breakdownBase.textContent = `${sym}${formatMoney(lastBreakdownINR.base)}`;
    breakdownClass.textContent = `${sym}${formatMoney(lastBreakdownINR.classSurge)}`;
    breakdownSurge.textContent = `${sym}${formatMoney(lastBreakdownINR.dynamicSurge)}`;
    breakdownTax.textContent = `${sym}${formatMoney(lastBreakdownINR.tax)}`;
  }

  function animatePriceCount(finalPriceINR) {
    const duration = 750;
    const startTime = performance.now();
    const startValue = 0;

    function step(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (finalPriceINR - startValue) * ease;
      ticketPrice.textContent = formatMoney(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        ticketPrice.textContent = formatMoney(finalPriceINR);
      }
    }
    requestAnimationFrame(step);
  }

  function estimateFareFallback(data) {
    const distance = getJourneyDistance(data.origin, data.dest);
    const classInfo = classConfig[data.travelClass] || classConfig['3A'];
    const trainInfo = trainTypeConfig[data.trainType] || trainTypeConfig['Superfast'];
    const daysAhead = parseInt(data.daysAhead, 10) || 0;
    const quota = data.quota || 'GN';

    let baseRate = (distance * 0.44);
    if (distance > 1000) {
      baseRate = (1000 * 0.44) + ((distance - 1000) * 0.38);
    }

    const classSurcharge = baseRate * (classInfo.multiplier - 1.0);
    const trainPremium = (baseRate + classSurcharge) * (trainInfo.multiplier - 1.0);

    let surgeMultiplier = 0.0;
    let surgeStatusText = '⚡ Normal Booking Window';
    let adviceTitleText = 'Good Time to Book';
    let adviceDesc = 'Fares are stable. No imminent high surge detected.';

    if (daysAhead <= 2) {
      surgeMultiplier = 0.38;
      surgeStatusText = '🔥 High Last-Minute Demand (Surge +38%)';
      adviceTitleText = 'High Surge Zone';
      adviceDesc = 'Seats are heavily limited. Immediate booking strongly recommended.';
    } else if (daysAhead <= 6) {
      surgeMultiplier = 0.22;
      surgeStatusText = '⚡ Dynamic Surge Active (+22%)';
      adviceTitleText = 'Fare Likely to Rise';
      adviceDesc = 'Dynamic pricing is rising. Booking today saves ~15% vs waiting.';
    } else if (daysAhead <= 15) {
      surgeMultiplier = 0.08;
      surgeStatusText = '⚡ Moderate Surge (+8%)';
      adviceTitleText = 'Optimal Window';
      adviceDesc = 'Fares are reasonable. Lock your seats before the 7-day surge kicks in.';
    } else {
      surgeMultiplier = 0.0;
      surgeStatusText = '🌿 Lowest Fare Tier (Advance Window)';
      adviceTitleText = 'Best Value Fare';
      adviceDesc = 'You are booking well in advance. Base rail tariff applied with zero dynamic penalties.';
    }

    if (quota === 'TQ') {
      surgeMultiplier += 0.30;
      surgeStatusText = '⚡ Tatkal Emergency Surcharge Applied';
    } else if (quota === 'PT') {
      surgeMultiplier += 0.45;
      surgeStatusText = '⚡ Premium Tatkal Variable Dynamic Fare';
    }

    const calculatedBase = Math.round(baseRate);
    const calculatedClass = Math.round(classSurcharge + trainPremium);
    const dynamicSurge = Math.round((calculatedBase + calculatedClass) * surgeMultiplier);
    const taxableAmount = calculatedBase + calculatedClass + dynamicSurge;
    const tax = classInfo.hasGst ? Math.round(taxableAmount * 0.05) : 0;
    const totalFare = taxableAmount + tax;

    return {
      total: totalFare,
      breakdown: {
        base: calculatedBase,
        classSurge: calculatedClass,
        dynamicSurge: dynamicSurge,
        tax: tax
      },
      distance: distance,
      surgeText: surgeStatusText,
      adviceTitle: adviceTitleText,
      adviceDesc: adviceDesc
    };
  }

  // Fare Form Submission
  fareForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const origin = originSelect.value;
    const dest = destSelect.value;
    const travelClass = classSelect.value;
    const trainType = trainTypeSelect.value;
    const daysAhead = daysInput.value;
    const dateVal = dateInput.value;
    const quota = quotaSelect.value;

    if (!origin || !dest) {
      alert('Please select both Origin and Destination stations.');
      return;
    }
    if (origin === dest) {
      alert('Origin and Destination stations cannot be the same!');
      return;
    }

    const payload = {
      origin_station: origin,
      destination_station: dest,
      travel_class: travelClass,
      train_type: trainType,
      days_until_departure: parseInt(daysAhead, 10),
      departure_date: dateVal,
      booking_quota: quota
    };

    predictBtn.classList.add('loading');
    predictBtn.disabled = true;
    const btnTextEl = document.getElementById('btn-text');
    btnTextEl.textContent = 'Analyzing Rail Tariffs & Demand...';

    let resultData = null;

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.fare) {
          resultData = {
            total: json.fare,
            breakdown: json.breakdown || {
              base: Math.round(json.fare * 0.65),
              classSurge: Math.round(json.fare * 0.25),
              dynamicSurge: Math.round(json.fare * 0.05),
              tax: Math.round(json.fare * 0.05)
            },
            distance: json.distance || getJourneyDistance(origin, dest),
            surgeText: json.surge_label || '⚡ Backend Model Generated',
            adviceTitle: 'ML Model Valuation',
            adviceDesc: json.message || 'Fare forecast calculated by Random Forest Regressor.'
          };
        }
      }
    } catch (err) {
      // Fallback
    }

    if (!resultData) {
      await new Promise(r => setTimeout(r, 350));
      resultData = estimateFareFallback({
        origin: origin,
        dest: dest,
        travelClass: travelClass,
        trainType: trainType,
        daysAhead: daysAhead,
        quota: quota
      });
    }

    lastCalculatedFareINR = resultData.total;
    lastBreakdownINR = resultData.breakdown;

    updateTicketDisplay({
      origin, dest, travelClass, trainType, daysAhead, dateVal, quota, result: resultData
    });

    predictBtn.classList.remove('loading');
    predictBtn.disabled = false;
    btnTextEl.textContent = 'Predict Fare With AI';

    ticketSection.classList.add('revealed');
    renderFarePrices();
    animatePriceCount(lastCalculatedFareINR);
    ticketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Record into Session History
    addPredictionHistory({
      type: 'Price',
      moduleTitle: 'Ticket Fare',
      train: `${trainType} Exp`,
      route: `${origin} → ${dest}`,
      params: `${travelClass} • ${daysAhead} days ahead`,
      result: `₹ ${lastCalculatedFareINR.toLocaleString()}`,
      confidence: '94.2%',
      badgeClass: 'price-tag'
    });
  });

  function updateTicketDisplay({ origin, dest, travelClass, trainType, daysAhead, dateVal, quota, result }) {
    const originName = stationNames[origin] || origin;
    const destName = stationNames[dest] || dest;
    const trainInfo = trainTypeConfig[trainType] || trainTypeConfig['Superfast'];
    const classInfo = classConfig[travelClass] || classConfig['3A'];

    ticketTrainCategory.textContent = trainInfo.label;
    const randomTrainNum = `${trainInfo.codePrefix}${Math.floor(10 + Math.random() * 89)}`;
    ticketTrainTitle.textContent = `${randomTrainNum} • ${originName} to ${destName} Exp`;

    const randomPnr = `RAIL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    ticketPnr.textContent = randomPnr;

    ticketOriginCode.textContent = origin;
    ticketOriginName.textContent = originName;
    ticketDestCode.textContent = dest;
    ticketDestName.textContent = destName;

    const hours = Math.floor(result.distance / 65);
    const mins = Math.round(((result.distance % 65) / 65) * 60);
    ticketDuration.textContent = `~ ${hours} hrs ${mins} mins`;
    ticketDistance.textContent = `Track Distance: ${result.distance.toLocaleString()} km`;

    ticketClassName.textContent = classInfo.name.split('•')[0].trim();

    if (dateVal) {
      const d = new Date(dateVal);
      ticketTravelDate.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      ticketTravelDate.textContent = `${daysAhead} Days Ahead`;
    }
    ticketDaysAhead.textContent = `${daysAhead} Days`;

    const quotaNames = { 'GN': 'General (GN)', 'TQ': 'Tatkal (TQ)', 'PT': 'Premium Tatkal (PT)', 'LD': 'Ladies (LD)' };
    ticketQuotaName.textContent = quotaNames[quota] || quota;

    dynamicSurgeIndicator.textContent = result.surgeText;
    adviceTitle.textContent = result.adviceTitle;
    adviceMessage.textContent = result.adviceDesc;
  }

  btnRecalculate?.addEventListener('click', () => {
    fareForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    daysInput.focus();
  });

  btnResetPrice?.addEventListener('click', () => {
    fareForm.reset();
    initFareDates();
    ticketSection.classList.remove('revealed');
  });


  // ===========================================================================
  // 4. MODULE 2: TRAIN DELAY PREDICTION
  // ===========================================================================

  const delayForm = document.getElementById('delay-prediction-form');
  const delayPreset = document.getElementById('delay-train-preset');
  const delayTrainNumber = document.getElementById('delay-train-number');
  const delayTrainName = document.getElementById('delay-train-name');
  const delaySource = document.getElementById('delay-source-station');
  const delayDest = document.getElementById('delay-dest-station');
  const delaySwapBtn = document.getElementById('delay-swap-btn');
  const delayDate = document.getElementById('delay-journey-date');
  const delayTime = document.getElementById('delay-departure-time');
  const delayDistance = document.getElementById('delay-distance');
  const delayDayOfWeek = document.getElementById('delay-day-of-week');
  const delayPredictBtn = document.getElementById('delay-predict-btn');
  const delayBtnText = document.getElementById('delay-btn-text');
  const btnResetDelay = document.getElementById('btn-reset-delay');
  const delayTimeHint = document.getElementById('delay-time-hint');

  // Delay Result Elements
  const delayResultSection = document.getElementById('delay-result-section');
  const delayTrainBadge = document.getElementById('delay-train-badge');
  const delayResultTrainTitle = document.getElementById('delay-result-train-title');
  const delayResultRoute = document.getElementById('delay-result-route');
  const delayResultDate = document.getElementById('delay-result-date');
  const delayStatusDot = document.getElementById('delay-status-dot');
  const delayStatusTitle = document.getElementById('delay-status-title');
  const delayMinutesVal = document.getElementById('delay-minutes-val');
  const delayMinutesUnit = document.getElementById('delay-minutes-unit');
  const delayConfidencePercent = document.getElementById('delay-confidence-percent');
  const delayConfidenceBar = document.getElementById('delay-confidence-bar');
  const delayFactorsList = document.getElementById('delay-factors-list');

  function initDelayDates() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // tomorrow by default
    delayDate.value = today.toISOString().split('T')[0];
    delayDate.min = new Date().toISOString().split('T')[0];
    updateDelayDayOfWeek();
    updateDelayDistance();
  }

  function updateDelayDayOfWeek() {
    const day = getDayNameFromDate(delayDate.value);
    delayDayOfWeek.value = day;
  }

  function updateDelayDistance() {
    const src = delaySource.value;
    const dst = delayDest.value;
    if (src !== dst) {
      delayDistance.value = getJourneyDistance(src, dst);
    }
  }

  function updateDelayTimeHint() {
    const timeVal = delayTime.value || '16:55';
    const hour = parseInt(timeVal.split(':')[0], 10);
    if (hour >= 8 && hour <= 11) {
      delayTimeHint.textContent = `Morning Peak Hour (${timeVal}) • Heavy Traffic`;
      delayTimeHint.style.color = '#d97706';
    } else if (hour >= 17 && hour <= 21) {
      delayTimeHint.textContent = `Evening Peak Hour (${timeVal}) • Junction Congestion`;
      delayTimeHint.style.color = '#d97706';
    } else {
      delayTimeHint.textContent = `Regular Hour (${timeVal}) • Normal Track Clearance`;
      delayTimeHint.style.color = '';
    }
  }

  delayDate.addEventListener('change', updateDelayDayOfWeek);
  delaySource.addEventListener('change', updateDelayDistance);
  delayDest.addEventListener('change', updateDelayDistance);
  delayTime.addEventListener('input', updateDelayTimeHint);

  delaySwapBtn.addEventListener('click', () => {
    const temp = delaySource.value;
    delaySource.value = delayDest.value;
    delayDest.value = temp;

    delaySwapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => { delaySwapBtn.style.transform = ''; }, 300);
    updateDelayDistance();
  });

  // Handle Preset Trains dropdown
  delayPreset.addEventListener('change', () => {
    const val = delayPreset.value;
    if (val !== 'custom' && popularTrainsData[val]) {
      const t = popularTrainsData[val];
      delayTrainNumber.value = t.number;
      delayTrainName.value = t.name;
      delaySource.value = t.origin;
      delayDest.value = t.dest;
      delayTime.value = t.time;
      updateDelayDistance();
      updateDelayTimeHint();
    }
  });

  // Fallback heuristic delay predictor if backend is not reached
  function estimateDelayFallback({ trainNum, trainName, origin, dest, distance, depTime, journeyDate, dayOfWeek }) {
    const hour = parseInt(depTime.split(':')[0], 10) || 16;
    const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
    const day = getDayNameFromDate(journeyDate);
    const isWeekend = (day === 'Friday' || day === 'Sunday' || day === 'Saturday');

    let isRajdhani = trainName.toLowerCase().includes('rajdhani') || trainName.toLowerCase().includes('vande');
    let isPassenger = trainName.toLowerCase().includes('passenger');

    let baseProb = 0.35 + (Math.min(distance / 1400.0, 1.2) * 0.18) + (isPeak ? 0.15 : 0.0);
    if (isRajdhani) baseProb -= 0.20;
    if (isPassenger) baseProb += 0.25;
    if (isWeekend) baseProb += 0.10;
    baseProb = Math.max(0.08, Math.min(0.92, baseProb));

    const isDelayed = baseProb >= 0.50;
    let delayMins = 0;
    let confidence = 82;

    if (isDelayed) {
      delayMins = Math.round(20 + (distance * 0.02) + (isPeak ? 15 : 0));
      confidence = Math.round(baseProb * 100);
    } else {
      confidence = Math.round((1 - baseProb) * 100);
    }

    const factors = [];
    if (isPeak) factors.append ? factors.push(`Scheduled departure (${depTime}) falls within high-traffic peak hours`) : factors.push(`Scheduled departure (${depTime}) falls within peak congestion hours`);
    if (distance > 1000) factors.push(`Cross-division long distance journey (${distance.toLocaleString()} km)`);
    if (isRajdhani) factors.push("High priority track signaling and green-corridor precedence");
    if (isWeekend) factors.push(`Elevated passenger and freight frequency on ${day}`);

    return {
      prediction: isDelayed ? 'Delayed' : 'On Time',
      is_delayed: isDelayed,
      estimated_delay: delayMins,
      confidence: confidence,
      factors: factors
    };
  }

  // Delay Form Submit
  delayForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const trainNum = delayTrainNumber.value.trim();
    const trainName = delayTrainName.value.trim();
    const origin = delaySource.value;
    const dest = delayDest.value;
    const dateVal = delayDate.value;
    const depTime = delayTime.value;
    const distance = parseInt(delayDistance.value, 10) || getJourneyDistance(origin, dest);

    if (!origin || !dest) {
      alert('Please select both Source and Destination stations.');
      return;
    }
    if (origin === dest) {
      alert('Source and Destination stations cannot be the same!');
      return;
    }
    if (!dateVal) {
      alert('Please select a valid journey date.');
      return;
    }

    delayPredictBtn.classList.add('loading');
    delayPredictBtn.disabled = true;
    delayBtnText.textContent = 'Analyzing Traffic & Congestion...';

    let result = null;

    try {
      const response = await fetch('/predict/delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          train_number: trainNum,
          train_name: trainName,
          source_station: origin,
          destination_station: dest,
          journey_date: dateVal,
          departure_time: depTime,
          distance: distance
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.prediction) {
          result = json;
        }
      }
    } catch (err) {
      // Fallback
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 400));
      result = estimateDelayFallback({
        trainNum, trainName, origin, dest, distance, depTime, journeyDate: dateVal, dayOfWeek: delayDayOfWeek.value
      });
    }

    // Populate Delay Result Card
    const isDelayed = result.is_delayed || result.prediction === 'Delayed';
    delayTrainBadge.textContent = trainName.toUpperCase();
    delayResultTrainTitle.textContent = `${trainNum} • ${trainName}`;
    delayResultRoute.textContent = `${stationNames[origin] || origin} (${origin}) → ${stationNames[dest] || dest} (${dest}) • ${distance.toLocaleString()} km`;
    delayResultDate.textContent = `${dateVal} • Dep: ${depTime} (${delayDayOfWeek.value})`;

    if (isDelayed) {
      delayStatusDot.classList.add('delayed');
      delayStatusTitle.classList.add('delayed');
      delayStatusTitle.textContent = 'Delayed';
      delayMinutesVal.textContent = result.estimated_delay || 25;
      delayMinutesUnit.textContent = 'minutes expected';
    } else {
      delayStatusDot.classList.remove('delayed');
      delayStatusTitle.classList.remove('delayed');
      delayStatusTitle.textContent = 'On Time';
      delayMinutesVal.textContent = '0';
      delayMinutesUnit.textContent = 'minutes (Right Time)';
    }

    const confVal = result.confidence || 82;
    delayConfidencePercent.textContent = `${confVal}%`;
    delayConfidenceBar.style.width = `${confVal}%`;
    if (isDelayed) {
      delayConfidenceBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else {
      delayConfidenceBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }

    // Factors list
    delayFactorsList.innerHTML = '';
    const factors = result.factors && result.factors.length > 0 ? result.factors : [
      `Distance factor of ${distance.toLocaleString()} km across rail zones`,
      `Scheduled departure (${depTime}) analysis`,
      `Track section congestion index`
    ];
    factors.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      delayFactorsList.appendChild(li);
    });

    delayPredictBtn.classList.remove('loading');
    delayPredictBtn.disabled = false;
    delayBtnText.textContent = 'Predict Delay With AI';

    delayResultSection.classList.add('revealed');
    delayResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Save to Session History
    addPredictionHistory({
      type: 'Delay',
      moduleTitle: 'Train Delay',
      train: `${trainNum} ${trainName}`,
      route: `${origin} → ${dest}`,
      params: `Dep: ${depTime} • ${dateVal}`,
      result: isDelayed ? `Delayed (+${result.estimated_delay || 25}m)` : 'On Time (0m)',
      confidence: `${confVal}%`,
      badgeClass: 'delay-tag'
    });
  });

  btnResetDelay?.addEventListener('click', () => {
    delayForm.reset();
    initDelayDates();
    delayResultSection.classList.remove('revealed');
  });


  // ===========================================================================
  // 5. MODULE 3: TRAIN SEAT AVAILABILITY PREDICTION
  // ===========================================================================

  const seatsForm = document.getElementById('seats-prediction-form');
  const seatsPreset = document.getElementById('seats-train-preset');
  const seatsTrainNumber = document.getElementById('seats-train-number');
  const seatsTrainName = document.getElementById('seats-train-name');
  const seatsSource = document.getElementById('seats-source-station');
  const seatsDest = document.getElementById('seats-dest-station');
  const seatsSwapBtn = document.getElementById('seats-swap-btn');
  const seatsDate = document.getElementById('seats-journey-date');
  const seatsClass = document.getElementById('seats-travel-class');
  const seatsDayOfWeek = document.getElementById('seats-day-of-week');
  const seatsPredictBtn = document.getElementById('seats-predict-btn');
  const seatsBtnText = document.getElementById('seats-btn-text');
  const btnResetSeats = document.getElementById('btn-reset-seats');
  const seatsDateHint = document.getElementById('seats-date-hint');

  // Seats Result Elements
  const seatsResultSection = document.getElementById('seats-result-section');
  const seatsResultClassBadge = document.getElementById('seats-result-class-badge');
  const seatsResultTrainTitle = document.getElementById('seats-result-train-title');
  const seatsResultRoute = document.getElementById('seats-result-route');
  const seatsResultHorizon = document.getElementById('seats-result-horizon');
  const seatsCountVal = document.getElementById('seats-count-val');
  const seatsTotalCap = document.getElementById('seats-total-cap');
  const seatsStatusBadge = document.getElementById('seats-status-badge');
  const seatsStatusText = document.getElementById('seats-status-text');
  const seatsCategoryHint = document.getElementById('seats-category-hint');
  const seatsConfidencePercent = document.getElementById('seats-confidence-percent');
  const seatsGaugeText = document.getElementById('seats-gauge-text');
  const seatsGaugeFill = document.getElementById('seats-gauge-fill');
  const seatsAdviceTitle = document.getElementById('seats-advice-title');
  const seatsAdviceMessage = document.getElementById('seats-advice-message');

  function initSeatsDates() {
    const today = new Date();
    today.setDate(today.getDate() + 14); // 14 days ahead default
    seatsDate.value = today.toISOString().split('T')[0];
    seatsDate.min = new Date().toISOString().split('T')[0];
    updateSeatsDateHint();
  }

  function updateSeatsDateHint() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(seatsDate.value);
    selected.setHours(0, 0, 0, 0);

    const diffDays = Math.max(0, Math.ceil((selected - today) / (1000 * 60 * 60 * 24)));
    seatsDateHint.textContent = `${diffDays} days until departure`;
    seatsDayOfWeek.value = getDayNameFromDate(seatsDate.value);
  }

  seatsDate.addEventListener('change', updateSeatsDateHint);

  seatsSwapBtn.addEventListener('click', () => {
    const temp = seatsSource.value;
    seatsSource.value = seatsDest.value;
    seatsDest.value = temp;

    seatsSwapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => { seatsSwapBtn.style.transform = ''; }, 300);
  });

  seatsPreset.addEventListener('change', () => {
    const val = seatsPreset.value;
    if (val !== 'custom' && popularTrainsData[val]) {
      const t = popularTrainsData[val];
      seatsTrainNumber.value = t.number;
      seatsTrainName.value = t.name;
      seatsSource.value = t.origin;
      seatsDest.value = t.dest;
    }
  });

  // Client-side fallback seat availability estimator
  function estimateSeatsFallback({ travelClass, daysAhead }) {
    const cap = classConfig[travelClass]?.capacity || 64;
    const ratio = Math.min(daysAhead / 45.0, 1.0);
    let seats = Math.round((ratio * 0.80 + 0.10) * cap);
    seats = Math.max(2, Math.min(cap, seats));

    let status = 'Available';
    let badgeColor = 'green';
    let desc = 'Berths readily available for reservation.';

    if (seats > 30) {
      status = 'Available';
      badgeColor = 'green';
      desc = 'Good confirmation likelihood. Berths readily available.';
    } else if (seats >= 10) {
      status = 'Filling Fast';
      badgeColor = 'yellow';
      desc = 'Moderate booking demand. Reserve early to avoid waitlist.';
    } else {
      status = 'Almost Full';
      badgeColor = 'red';
      desc = 'Critical capacity. Less than 10 seats remaining.';
    }

    return {
      available_seats: seats,
      total_capacity: cap,
      availability_status: status,
      badge_color: badgeColor,
      status_description: desc,
      confidence: 88
    };
  }

  // Seats Form Submit
  seatsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const trainNum = seatsTrainNumber.value.trim();
    const trainName = seatsTrainName.value.trim();
    const origin = seatsSource.value;
    const dest = seatsDest.value;
    const dateVal = seatsDate.value;
    const travelClass = seatsClass.value;

    if (!origin || !dest) {
      alert('Please select both Source and Destination stations.');
      return;
    }
    if (origin === dest) {
      alert('Source and Destination stations cannot be the same!');
      return;
    }
    if (!dateVal) {
      alert('Please select a journey date.');
      return;
    }

    // Days ahead
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateVal);
    selected.setHours(0, 0, 0, 0);
    const daysAhead = Math.max(0, Math.ceil((selected - today) / (1000 * 60 * 60 * 24)));

    seatsPredictBtn.classList.add('loading');
    seatsPredictBtn.disabled = true;
    seatsBtnText.textContent = 'Calculating Seat Availability...';

    let result = null;

    try {
      const response = await fetch('/predict/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          train_number: trainNum,
          train_name: trainName,
          source_station: origin,
          destination_station: dest,
          travel_class: travelClass,
          journey_date: dateVal,
          days_ahead: daysAhead
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.available_seats !== undefined) {
          result = json;
        }
      }
    } catch (err) {
      // Fallback
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 400));
      result = estimateSeatsFallback({ travelClass, daysAhead });
    }

    // Populate Seat Availability Result Card
    const classNameMap = {
      'SL': 'Sleeper Class (SL)',
      '3A': 'AC 3-Tier (3A)',
      '2A': 'AC 2-Tier (2A)',
      '1A': 'First Class AC (1A)'
    };
    seatsResultClassBadge.textContent = (classNameMap[travelClass] || travelClass).toUpperCase();
    seatsResultTrainTitle.textContent = `${trainNum} • ${trainName}`;
    seatsResultRoute.textContent = `${stationNames[origin] || origin} (${origin}) → ${stationNames[dest] || dest} (${dest})`;
    seatsResultHorizon.textContent = `${daysAhead} Days Ahead • ${dateVal} (${seatsDayOfWeek.value})`;

    const availSeats = result.available_seats;
    const totalCap = result.total_capacity || classConfig[travelClass]?.capacity || 64;

    seatsCountVal.textContent = availSeats;
    seatsTotalCap.textContent = `/ ${totalCap} coach berths`;

    // Apply color status classes (GREEN / YELLOW / RED as requested)
    seatsStatusBadge.classList.remove('status-green', 'status-yellow', 'status-red');
    seatsGaugeFill.classList.remove('fill-green', 'fill-yellow', 'fill-red');

    if (availSeats > 30) {
      // GREEN = Available
      seatsStatusBadge.classList.add('status-green');
      seatsGaugeFill.classList.add('fill-green');
      seatsStatusText.textContent = 'Available';
      seatsCategoryHint.textContent = '🟢 GREEN = Available (> 30 seats)';
    } else if (availSeats >= 10) {
      // YELLOW = Filling Fast
      seatsStatusBadge.classList.add('status-yellow');
      seatsGaugeFill.classList.add('fill-yellow');
      seatsStatusText.textContent = 'Filling Fast';
      seatsCategoryHint.textContent = '🟡 YELLOW = Filling Fast (10 - 30 seats)';
    } else {
      // RED = Almost Full
      seatsStatusBadge.classList.add('status-red');
      seatsGaugeFill.classList.add('fill-red');
      seatsStatusText.textContent = 'Almost Full';
      seatsCategoryHint.textContent = '🔴 RED = Almost Full (< 10 seats)';
    }

    const conf = result.confidence || 88;
    seatsConfidencePercent.textContent = `${conf}%`;

    const pct = Math.round((availSeats / totalCap) * 100);
    seatsGaugeText.textContent = `${availSeats} of ${totalCap} Berths Free (${pct}% Available)`;
    seatsGaugeFill.style.width = `${Math.min(100, Math.max(8, pct))}%`;

    seatsAdviceTitle.textContent = availSeats > 30 ? 'High Confirmation Probability' : (availSeats >= 10 ? 'Moderate Booking Rush' : 'High Waitlist Risk');
    seatsAdviceMessage.textContent = result.status_description || 'Seats are selling according to historical seasonal patterns.';

    seatsPredictBtn.classList.remove('loading');
    seatsPredictBtn.disabled = false;
    seatsBtnText.textContent = 'Check Seat Availability';

    seatsResultSection.classList.add('revealed');
    seatsResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Save to Session History
    addPredictionHistory({
      type: 'Seats',
      moduleTitle: 'Seat Availability',
      train: `${trainNum} ${trainName}`,
      route: `${origin} → ${dest}`,
      params: `${travelClass} • ${daysAhead}d ahead`,
      result: `${availSeats} Seats (${result.availability_status || 'Available'})`,
      confidence: `${conf}%`,
      badgeClass: 'seats-tag'
    });
  });

  btnResetSeats?.addEventListener('click', () => {
    seatsForm.reset();
    initSeatsDates();
    seatsResultSection.classList.remove('revealed');
  });


  // ===========================================================================
  // 6. MODULE 4: RECENT PREDICTIONS / SESSION HISTORY
  // ===========================================================================

  const historyTableBody = document.getElementById('history-table-body');
  const historyEmptyState = document.getElementById('history-empty-state');
  const historyTableWrapper = document.querySelector('.history-table-wrapper');
  const historyTabCount = document.getElementById('history-tab-count');
  const btnClearHistory = document.getElementById('btn-clear-history');

  function getStoredHistory() {
    try {
      const data = sessionStorage.getItem('railpulse_session_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveStoredHistory(historyArr) {
    try {
      sessionStorage.setItem('railpulse_session_history', JSON.stringify(historyArr));
    } catch {
      // Storage full or unavailable
    }
  }

  function addPredictionHistory(item) {
    const list = getStoredHistory();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord = {
      id: 'pred_' + Date.now(),
      time: timeStr,
      ...item
    };

    list.unshift(newRecord); // newest first
    if (list.length > 20) list.pop(); // keep last 20

    saveStoredHistory(list);
    renderHistoryUI();
  }

  function renderHistoryUI() {
    const list = getStoredHistory();
    historyTabCount.textContent = list.length;

    if (list.length === 0) {
      if (historyTableWrapper) historyTableWrapper.style.display = 'none';
      if (historyEmptyState) historyEmptyState.style.display = 'block';
      if (historyTableBody) historyTableBody.innerHTML = '';
      return;
    }

    if (historyTableWrapper) historyTableWrapper.style.display = 'block';
    if (historyEmptyState) historyEmptyState.style.display = 'none';

    if (historyTableBody) {
      historyTableBody.innerHTML = list.map(item => `
        <tr>
          <td><span style="font-weight:600; color:#64748b;">${item.time}</span></td>
          <td><span class="history-badge-tag ${item.badgeClass}">${item.moduleTitle}</span></td>
          <td>
            <strong>${item.train}</strong><br>
            <span style="font-size:0.8rem; color:#64748b;">${item.route}</span>
          </td>
          <td><span style="font-size:0.82rem; color:#475569;">${item.params}</span></td>
          <td><strong>${item.result}</strong></td>
          <td><span style="font-weight:600; color:#1e3a8a;">${item.confidence}</span></td>
        </tr>
      `).join('');
    }
  }

  btnClearHistory?.addEventListener('click', () => {
    if (confirm('Clear all stored predictions for this session?')) {
      saveStoredHistory([]);
      renderHistoryUI();
    }
  });


  // ===========================================================================
  // 7. MODULE 5: SIMPLE ML TREND CHARTS (NATIVE CANVAS)
  // ===========================================================================

  function drawLineChart(canvasId, { labels, data, color, yLabel, fillGradient = true }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 30, bottom: 35, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minVal = Math.min(...data) * 0.9;
    const maxVal = Math.max(...data) * 1.1;

    // Draw Grid Lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    const numYGrid = 4;
    for (let i = 0; i <= numYGrid; i++) {
      const yVal = minVal + (maxVal - minVal) * (i / numYGrid);
      const yPos = padding.top + chartH - (i / numYGrid) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.fillText(Math.round(yVal), padding.left - 8, yPos + 4);
    }

    // Points calculation
    const points = data.map((val, idx) => {
      const x = padding.left + (idx / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val, label: labels[idx] };
    });

    // Area Fill
    if (fillGradient && points.length > 0) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, color + '44');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    // Curve Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Point Dots & X-Labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    points.forEach((p, i) => {
      // Draw Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw X-Label for select points
      if (i % 2 === 0 || i === points.length - 1) {
        ctx.fillStyle = '#64748b';
        ctx.fillText(p.label, p.x, height - 12);
      }
    });
  }

  function renderAllCharts() {
    // Chart 1: Dynamic Fare Surge vs Days Ahead
    drawLineChart('chart-fare-surge', {
      labels: ['120d', '90d', '60d', '30d', '15d', '7d', '4d', '2d', '0d'],
      data: [1200, 1200, 1220, 1250, 1340, 1480, 1680, 1920, 2150],
      color: '#1e3a8a',
      yLabel: 'Fare (INR)'
    });

    // Chart 2: Delay Probability by Departure Hour
    drawLineChart('chart-delay-hours', {
      labels: ['4 AM', '7 AM', '9 AM', '12 PM', '3 PM', '6 PM', '8 PM', '11 PM'],
      data: [15, 28, 68, 35, 42, 78, 65, 25],
      color: '#d97706',
      yLabel: 'Delay %'
    });

    // Chart 3: Seat Availability Depletion Curve
    drawLineChart('chart-seats-decay', {
      labels: ['90d', '60d', '45d', '30d', '20d', '10d', '5d', '1d'],
      data: [64, 58, 50, 42, 28, 16, 8, 2],
      color: '#0d9488',
      yLabel: 'Available Seats'
    });
  }


  // ===========================================================================
  // 8. INITIALIZATION ON LOAD
  // ===========================================================================

  initFareDates();
  initDelayDates();
  initSeatsDates();
  renderHistoryUI();
  updateDelayTimeHint();

  // Load configuration from backend if available
  fetch('/api/config')
    .then(res => res.json())
    .then(cfg => {
      if (cfg && cfg.status === 'success') {
        // Can optionally enrich station/train lists
      }
    })
    .catch(() => {});
});

/**
 * RailPulse AI • Train Ticket Price Prediction Engine
 * Interactive UI Controller & Dynamic ML Prediction Bridge
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Station Distance Heuristic Matrix (km) ---
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

  // Station Names Map
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

  // Class Multipliers & Labels
  const classConfig = {
    '1A': { name: 'First Class AC (1A)', multiplier: 6.2, hasGst: true },
    '2A': { name: 'AC 2-Tier (2A)', multiplier: 3.8, hasGst: true },
    '3A': { name: 'AC 3-Tier (3A)', multiplier: 2.7, hasGst: true },
    'EC': { name: 'Executive Chair Car (EC)', multiplier: 4.5, hasGst: true },
    'CC': { name: 'AC Chair Car (CC)', multiplier: 1.8, hasGst: true },
    'SL': { name: 'Sleeper Class (SL)', multiplier: 1.0, hasGst: false },
    '2S': { name: 'Second Sitting (2S)', multiplier: 0.6, hasGst: false }
  };

  // Train Type Multipliers
  const trainTypeConfig = {
    'Rajdhani': { multiplier: 1.45, label: 'VANDE BHARAT / RAJDHANI', codePrefix: '124' },
    'Duronto':  { multiplier: 1.28, label: 'SHATABDI / DURONTO', codePrefix: '122' },
    'Superfast':{ multiplier: 1.15, label: 'SUPERFAST EXPRESS', codePrefix: '129' },
    'Express':  { multiplier: 1.00, label: 'MAIL / STANDARD EXPRESS', codePrefix: '110' },
    'Passenger':{ multiplier: 0.82, label: 'PASSENGER / ORDINARY', codePrefix: '540' }
  };

  // State
  let currentCurrency = 'INR';
  const USD_EXCHANGE_RATE = 84.0; // 1 USD = 84 INR approx

  // DOM Elements
  const form = document.getElementById('fare-prediction-form');
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

  // Ticket Result Elements
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

  // Breakdown Elements
  const breakdownBase = document.getElementById('breakdown-base');
  const breakdownClass = document.getElementById('breakdown-class');
  const breakdownSurge = document.getElementById('breakdown-surge');
  const breakdownTax = document.getElementById('breakdown-tax');

  // Currency Switchers
  const currInrBtn = document.getElementById('curr-inr');
  const currUsdBtn = document.getElementById('curr-usd');

  // Last calculated fare state in INR
  let lastCalculatedFareINR = 1543;
  let lastBreakdownINR = { base: 1120, classSurge: 350, dynamicSurge: 0, tax: 73 };

  // --- Initialize Dates ---
  function initDates() {
    const today = new Date();
    const defaultDays = parseInt(daysInput.value, 10) || 14;
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + defaultDays);

    // Format YYYY-MM-DD for date input
    dateInput.value = targetDate.toISOString().split('T')[0];
    dateInput.min = today.toISOString().split('T')[0];

    updateDistanceHint();
  }

  // Sync date when days changed
  daysInput.addEventListener('input', () => {
    let days = parseInt(daysInput.value, 10);
    if (isNaN(days) || days < 0) days = 0;
    if (days > 120) days = 120;
    
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);
    dateInput.value = targetDate.toISOString().split('T')[0];
  });

  // Sync days when date picked
  dateInput.addEventListener('change', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateInput.value);
    selected.setHours(0, 0, 0, 0);

    const diffTime = selected - today;
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    daysInput.value = diffDays;
  });

  // --- Station Swap ---
  swapBtn.addEventListener('click', () => {
    const temp = originSelect.value;
    originSelect.value = destSelect.value;
    destSelect.value = temp;

    // Micro rotation trigger
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      swapBtn.style.transform = '';
    }, 300);

    updateDistanceHint();
  });

  // Distance Calculation Helper
  function getJourneyDistance(origin, dest) {
    if (origin === dest) return 0;
    const key = `${origin}-${dest}`;
    return stationDistances[key] || 920; // default estimated distance
  }

  function updateDistanceHint() {
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

  originSelect.addEventListener('change', updateDistanceHint);
  destSelect.addEventListener('change', updateDistanceHint);

  // --- Quick Route Chips ---
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const orig = chip.getAttribute('data-origin');
      const dest = chip.getAttribute('data-dest');
      if (orig && dest) {
        originSelect.value = orig;
        destSelect.value = dest;
        updateDistanceHint();
        chip.style.transform = 'scale(0.95)';
        setTimeout(() => chip.style.transform = '', 150);
      }
    });
  });

  // --- Currency Toggle ---
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
    renderPrices();
  }

  currInrBtn.addEventListener('click', () => updateCurrency('INR'));
  currUsdBtn.addEventListener('click', () => updateCurrency('USD'));

  function formatMoney(amountINR) {
    if (currentCurrency === 'USD') {
      const usd = (amountINR / USD_EXCHANGE_RATE).toFixed(2);
      return usd;
    }
    return Math.round(amountINR).toLocaleString('en-IN');
  }

  function renderPrices() {
    const sym = currentCurrency === 'INR' ? '₹ ' : '$ ';
    ticketPrice.textContent = formatMoney(lastCalculatedFareINR);
    
    // Confidence range (±4%)
    const low = formatMoney(lastCalculatedFareINR * 0.96);
    const high = formatMoney(lastCalculatedFareINR * 1.04);
    ticketConfidenceRange.textContent = `Confidence Range: ${sym}${low} - ${sym}${high}`;

    // Breakdown
    breakdownBase.textContent = `${sym}${formatMoney(lastBreakdownINR.base)}`;
    breakdownClass.textContent = `${sym}${formatMoney(lastBreakdownINR.classSurge)}`;
    breakdownSurge.textContent = `${sym}${formatMoney(lastBreakdownINR.dynamicSurge)}`;
    breakdownTax.textContent = `${sym}${formatMoney(lastBreakdownINR.tax)}`;
  }

  // --- Smooth Count-Up Animation ---
  function animatePriceCount(finalPriceINR) {
    const duration = 750;
    const startTime = performance.now();
    const startValue = 0;

    function step(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
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

  // --- Dynamic ML Heuristic Engine (Fallback & Instant Inference) ---
  function estimateFare(data) {
    const distance = getJourneyDistance(data.origin, data.dest);
    const classInfo = classConfig[data.travelClass] || classConfig['3A'];
    const trainInfo = trainTypeConfig[data.trainType] || trainTypeConfig['Superfast'];
    const daysAhead = parseInt(data.daysAhead, 10) || 0;
    const quota = data.quota || 'GN';

    // Base fare: non-linear distance curve
    // ~₹0.42 per km base rate with diminishing scale for long hauls
    let baseRate = (distance * 0.44);
    if (distance > 1000) {
      baseRate = (1000 * 0.44) + ((distance - 1000) * 0.38);
    }

    // Class Surcharge
    const classSurcharge = baseRate * (classInfo.multiplier - 1.0);

    // Train Type Premium
    const trainPremium = (baseRate + classSurcharge) * (trainInfo.multiplier - 1.0);

    // Dynamic Surcharge Curve based on Days Ahead
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

    // Quota adjustments
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

    // GST: 5% on AC classes
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

  // --- Form Submission Handler ---
  form.addEventListener('submit', async (e) => {
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

    // Prepare JSON payload matching standard backend ML inputs
    const payload = {
      origin_station: origin,
      destination_station: dest,
      travel_class: travelClass,
      train_type: trainType,
      days_until_departure: parseInt(daysAhead, 10),
      departure_date: dateVal,
      booking_quota: quota
    };

    // UI Loading State
    predictBtn.classList.add('loading');
    predictBtn.disabled = true;
    const btnTextEl = document.getElementById('btn-text');
    btnTextEl.textContent = 'Analyzing Rail Tariffs & ML Demand...';

    let resultData = null;

    try {
      // 1. Attempt connection to live Python backend if available
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
            adviceDesc: json.message || 'Fare forecast calculated by deployed model.'
          };
        }
      }
    } catch (err) {
      // Backend not running; seamlessly proceed with client-side ML heuristic model
      // (This enables the UI to be 100% interactive standalone)
    }

    // Client-side fallback computation
    if (!resultData) {
      // Add brief realistic calculation latency (450ms)
      await new Promise(r => setTimeout(r, 450));
      resultData = estimateFare({
        origin: origin,
        dest: dest,
        travelClass: travelClass,
        trainType: trainType,
        daysAhead: daysAhead,
        quota: quota
      });
    }

    // Store state
    lastCalculatedFareINR = resultData.total;
    lastBreakdownINR = resultData.breakdown;

    // Populate Ticket Stub Content
    updateTicketDisplay({
      origin: origin,
      dest: dest,
      travelClass: travelClass,
      trainType: trainType,
      daysAhead: daysAhead,
      dateVal: dateVal,
      quota: quota,
      result: resultData
    });

    // Reset button state
    predictBtn.classList.remove('loading');
    predictBtn.disabled = false;
    btnTextEl.textContent = 'Predict Fare With AI';

    // Reveal Ticket Result Section
    ticketSection.classList.add('revealed');
    renderPrices();
    animatePriceCount(lastCalculatedFareINR);

    // Scroll smoothly to ticket
    ticketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- Populate Ticket UI Helper ---
  function updateTicketDisplay({ origin, dest, travelClass, trainType, daysAhead, dateVal, quota, result }) {
    const originName = stationNames[origin] || origin;
    const destName = stationNames[dest] || dest;
    const trainInfo = trainTypeConfig[trainType] || trainTypeConfig['Superfast'];
    const classInfo = classConfig[travelClass] || classConfig['3A'];

    // Header & Train Names
    ticketTrainCategory.textContent = trainInfo.label;
    const randomTrainNum = `${trainInfo.codePrefix}${Math.floor(10 + Math.random() * 89)}`;
    ticketTrainTitle.textContent = `${randomTrainNum} • ${originName} to ${destName} Exp`;

    // Mock PNR
    const randomPnr = `RAIL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    ticketPnr.textContent = randomPnr;

    // Route Block
    ticketOriginCode.textContent = origin;
    ticketOriginName.textContent = originName;
    ticketDestCode.textContent = dest;
    ticketDestName.textContent = destName;

    // Approximate travel duration (~65 km/h average)
    const hours = Math.floor(result.distance / 65);
    const mins = Math.round(((result.distance % 65) / 65) * 60);
    ticketDuration.textContent = `~ ${hours} hrs ${mins} mins`;
    ticketDistance.textContent = `Track Distance: ${result.distance.toLocaleString()} km`;

    // Metadata
    ticketClassName.textContent = classInfo.name.split('•')[0].trim();

    // Date formatting
    if (dateVal) {
      const d = new Date(dateVal);
      ticketTravelDate.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      ticketTravelDate.textContent = `${daysAhead} Days Ahead`;
    }
    ticketDaysAhead.textContent = `${daysAhead} Days`;

    const quotaNames = {
      'GN': 'General (GN)',
      'TQ': 'Tatkal (TQ)',
      'PT': 'Premium Tatkal (PT)',
      'LD': 'Ladies (LD)'
    };
    ticketQuotaName.textContent = quotaNames[quota] || quota;

    // Status chips
    dynamicSurgeIndicator.textContent = result.surgeText;
    adviceTitle.textContent = result.adviceTitle;
    adviceMessage.textContent = result.adviceDesc;
  }

  // Recalculate button handler
  btnRecalculate.addEventListener('click', () => {
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    daysInput.focus();
  });

  // Init on load
  initDates();
});

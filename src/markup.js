const markup = `<header>
  <div class="brand">GoMechanic &middot; Roadside assistance</div>
  <h1 id="page-title">Your job</h1>
  <span class="stage hidden" id="stage-pill"></span>
</header>

<div class="gate hidden" id="location-gate" role="alertdialog" aria-modal="true" aria-labelledby="location-gate-title" aria-describedby="location-gate-text">
  <div class="gate-card">
    <h2 class="gate-title" id="location-gate-title">Location needed</h2>
    <p id="location-gate-text">Location is needed for this trip. Allow location for this page to start.</p>
    <button class="gate-btn" id="allow-location" type="button">Allow location</button>
    <button class="gate-btn hidden" id="reload-page" type="button">Reload page</button>
  </div>
</div>
<div class="camera hidden" id="camera-sheet" role="dialog" aria-modal="true" aria-label="Take photo">
  <video id="camera-preview" autoplay playsinline muted></video>
  <div class="camera-status" id="camera-status">Starting camera&hellip;</div>
  <button class="camera-cancel" id="camera-cancel" type="button">Cancel</button>
  <div class="camera-bar">
    <p class="camera-help">Photos are taken live from the camera.</p>
    <button class="camera-shutter" id="camera-shutter" type="button" aria-label="Take photo" disabled><span></span></button>
  </div>
</div>
<div class="progress hidden" id="upload-progress" role="alertdialog" aria-modal="true" aria-live="polite" aria-labelledby="upload-progress-title" aria-describedby="upload-progress-sub">
  <div class="progress-card">
    <div class="spinner" aria-hidden="true"></div>
    <h2 class="progress-title" id="upload-progress-title">Uploading photo</h2>
    <p class="progress-sub hidden" id="upload-progress-sub"></p>
  </div>
</div>
<section id="view-assigning">
  <div class="card state" id="loading">Loading the job&hellip;</div>

  <div class="card state hidden" id="error">
    <strong id="error-title">This link does not open a job</strong>
    <span id="error-text">Ask the ops team for a fresh link.</span>
  </div>

  <div id="assigning-body" class="hidden">
    <button class="start" id="start-trip" type="button">Start Trip</button>
    <p class="start-hint">Tap when you leave for the customer</p>
    <div class="notice hidden" id="start-notice"></div>

    <div class="card">
      <h2>Customer</h2>
      <p class="name" id="customer-name"></p>
      <div class="row">
        <span class="label">Phone</span>
        <span class="value" id="customer-phone"></span>
      </div>
      <p class="address" id="customer-address"></p>
    </div>

    <div class="card">
      <h2>Vehicle</h2>
      <div class="row">
        <span class="label">Car</span>
        <span class="value" id="car-name"></span>
      </div>
      <div class="row">
        <span class="label">Registration</span>
        <span class="value"><span class="plate" id="car-reg"></span></span>
      </div>
    </div>

    <div class="card">
      <h2>Services booked</h2>
      <ul class="services" id="services"></ul>
      <p class="muted tiny hidden" id="services-empty">No service lines on this order.</p>
    </div>

    <div class="card">
      <h2>Job</h2>
      <div class="row">
        <span class="label">Order</span>
        <span class="value tiny muted" id="order-id"></span>
      </div>
      <div class="row">
        <span class="label">Photos</span>
        <span class="value tiny muted" id="photo-count"></span>
      </div>
    </div>
  </div>
</section>

<section id="view-trip">
  <div id="map"></div>
  <div id="eta-pill"><span class="dot"></span><span id="eta-text">&mdash;</span></div>
  <div id="gps-pill" class="hidden" role="status" aria-live="polite"></div>

  <div id="sheet">
    <div class="grab" id="sheet-grab" role="button" aria-label="Hide trip details" aria-expanded="true"><span class="bar"></span><div class="grab-title"><svg class="grip" width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="9" cy="8" r="1.5"/><circle cx="3" cy="13" r="1.5"/><circle cx="9" cy="13" r="1.5"/></svg><span class="grab-detail" id="grab-detail"></span><span id="grab-text">Hide trip details</span><span class="chev" id="grab-chev" aria-hidden="true">&#9662;</span></div></div>
    <div class="peek" id="sheet-peek">
      <div class="who" id="peek-name">&mdash;</div>
      <div class="what" id="peek-what">&mdash;</div>
      <button class="peek-action hidden" id="peek-reached" type="button">I have reached</button>
      <p class="lock-line hidden" id="peek-lock"></p>
    </div>
    <div class="sheet-body" id="sheet-body">

      <div class="notice hidden" id="trip-notice"></div>
      <div class="notice hidden" id="screen-hint">Keep the screen on while driving. Location sharing pauses when the screen locks.</div>

      <div class="card hidden" id="arrive-block">
        <h2>Arrival</h2>
        <p class="otp-copy">Tap when you are at the customer's car. It is only accepted close to their location.</p>
        <button class="action primary" id="reached" type="button">I have reached</button>
        <p class="lock-line hidden" id="arrive-lock"></p>
        <div class="notice hidden" id="arrive-notice"></div>
      </div>

      <div class="card hidden" id="otp-block">
        <h2>Arrival OTP</h2>
        <p class="otp-copy" id="otp-copy">Ask the customer for the 4-digit OTP shown in their app.</p>
        <input class="otp-input" id="otp-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4"
               autocomplete="one-time-code" aria-label="Arrival OTP">
        <button class="action primary" id="otp-submit" type="button">Verify OTP</button>
        <div class="notice hidden" id="otp-notice"></div>
      </div>

      <div class="card hidden" id="photos-block">
        <h2>Proof of work</h2>
        <p class="otp-copy" id="photos-copy">Photograph the car when the work is done. Four live photos close the job.</p>
        <div class="shots" id="shots"></div>
        <button class="action primary" id="take-photo" type="button">Take photo</button>
        <input class="hidden" id="camera" type="file" accept="image/*" capture="environment">
        <div class="notice hidden" id="photos-notice"></div>
        <button class="action hidden" id="complete" type="button">Complete job</button>
      </div>

      <div class="card hidden" id="done-block">
        <h2>Completed</h2>
        <p class="done-line" id="done-line">Job completed</p>
        <p class="muted tiny" id="done-copy">The invoice has been generated. Nothing else is needed from you.</p>
      </div>

      <div class="card">
        <h2>Customer</h2>
        <p class="name" id="trip-customer-name"></p>
        <div class="row">
          <span class="label">Phone</span>
          <span class="value" id="trip-customer-phone"></span>
        </div>
        <p class="address" id="trip-customer-address"></p>
        <button class="link-btn hidden" id="copy-address" type="button">Copy address</button>
      </div>

      <div class="card">
        <h2>Vehicle</h2>
        <div class="row">
          <span class="label">Car</span>
          <span class="value" id="trip-car-name"></span>
        </div>
        <div class="row">
          <span class="label">Registration</span>
          <span class="value"><span class="plate" id="trip-car-reg"></span></span>
        </div>
      </div>

      <div class="card">
        <h2>Services booked</h2>
        <ul class="services" id="trip-services"></ul>
      </div>

      <div class="card">
        <h2>Job</h2>
        <div class="row">
          <span class="label">Order id</span>
          <span class="value tiny muted" id="trip-order-id"></span>
        </div>
        <div class="row">
          <span class="label">Photos</span>
          <span class="value tiny muted" id="trip-photo-count"></span>
        </div>
      </div>
    </div>
  </div>
</section>
`;

export default markup;

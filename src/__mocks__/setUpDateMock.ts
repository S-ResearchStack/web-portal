let isEnabled = true;

const originalDateNow = Date.now;

Date.now = jest.fn(() => (isEnabled ? 1680842869025 : originalDateNow()));

export function enableDateNowMock() {
  isEnabled = true;
}

export function disableDateNowMock() {
  isEnabled = false;
}

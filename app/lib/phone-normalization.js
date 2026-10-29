/** @param {string} value @returns {string} */
export function normalizeParentPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // French exports mix 06…, +33 6…, 0033 6… and +33 (0)6… notation.
  if (digits.startsWith("33")) {
    digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    digits = `0${digits}`;
  }
  return digits;
}

/** A cell may contain several parent numbers; never let them concatenate. */
/** @param {string} value @returns {string[]} */
export function splitParentPhones(value) {
  return value.split(/[|;,/\r\n]+/).map((phone) => phone.trim()).filter(Boolean);
}

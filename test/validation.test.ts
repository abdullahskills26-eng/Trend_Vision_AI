import assert from 'node:assert';
import { validatePredictionInput } from '../src/utils/predictionValidation.ts';

const invalidInputs = [
  '.',
  '..',
  '...',
  ',',
  ',,',
  ',,,',
  "'",
  "''",
  "'''",
  '"',
  '""',
  '"""',
  ';',
  ';;',
  ';;;',
  ':',
  ':::',
  '<',
  '<<',
  '<<<',
  '>',
  '>>>',
  '!!!',
  '???',
  '@@@',
  '###',
  '$$$',
  '%%%',
  '^^^',
  '&&&',
  '***',
  '___',
  '+++',
  '===',
  '``',
  '.,;:\'"<>',
  ' ',
  '     ',
  '\n',
  '\t',
];

const validInputs = [
  'Monthly sales increased by 15% during the last quarter.',
  'Customer demand has increased significantly over the last six months.',
  'Revenue growth is steady in the core product line and margins look healthy.',
  'Revenue increased by 15%',
  'Profit margin: 18%',
  'Sales & Marketing Forecast',
  'Revenue @ Branch A',
  'Forecast #2026',
  'Branch-1 sales forecast',
];

console.log('Running validation unit tests...');

invalidInputs.forEach((input) => {
  const result = validatePredictionInput(input);
  assert.strictEqual(result.valid, false, `Expected invalid input to be rejected: ${JSON.stringify(input)}`);
  console.log(`✗ Rejected invalid input: ${JSON.stringify(input)} | message: ${result.message}`);
});

validInputs.forEach((input) => {
  const result = validatePredictionInput(input);
  assert.strictEqual(result.valid, true, `Expected valid input to pass: ${JSON.stringify(input)} (${result.message})`);
  assert.ok(result.qualityScore >= 70, `Expected qualityScore >= 70 for valid input, got ${result.qualityScore}.
Input: ${input}`);
  console.log(`✓ Accepted valid input: ${JSON.stringify(input)} | qualityScore: ${result.qualityScore}`);
});

console.log('All validation tests passed successfully.');

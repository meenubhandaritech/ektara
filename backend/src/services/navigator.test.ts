import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { checklistFor, DISCLAIMER, guide, type NavigatorAnswers } from './navigator.js';

const answers: NavigatorAnswers = {
  residence: 'india',
  status: 'resident-indian',
  relationship: 'unrelated',
  focus: 'general',
  knowsCaraCarings: 'no',
};

test('navigator suggests information without making an eligibility decision', () => {
  const result = guide(answers);

  assert.equal(result.route, 'in-country-resident');
  assert.equal(result.confident, false);
  assert.equal(result.disclaimer, DISCLAIMER);
  assert.match(result.summary, /information most likely to be relevant/);
});

test('navigator flags special family routes for professional confirmation', () => {
  const result = guide({ ...answers, relationship: 'stepchild', focus: 'hama' });

  assert.equal(result.route, 'step-parent');
  assert.equal(result.seekProfessionalHelp, true);
  assert.ok(result.frameworks.some((item) => /step-parent adoption/i.test(item)));
});

test('route-specific preparation checklist remains a preparation aid', () => {
  const checklist = checklistFor('relative');

  assert.ok(checklist.some((item) => item.id === 'relationship'));
  assert.ok(checklist.every((item) => /confirm against the current official instructions/i.test(item.description)));
});

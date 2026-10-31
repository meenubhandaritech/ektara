import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { refusalFor } from './assistant.js';

test('assistant refuses eligibility determinations', () => {
  assert.match(refusalFor('Am I eligible to adopt?') ?? '', /can’t decide whether you are legally eligible/i);
});

test('assistant refuses shortcuts and direct child-contact requests', () => {
  assert.match(refusalFor('How can I bypass CARINGS to adopt faster?') ?? '', /shortcuts/i);
  assert.match(refusalFor('Can I meet a child?') ?? '', /don’t approach children directly/i);
});

test('assistant refuses guaranteed or predicted timelines but accepts general information', () => {
  assert.match(refusalFor('Can you guarantee my referral?') ?? '', /can’t predict waiting times/i);
  assert.equal(refusalFor('What is CARA?'), null);
});

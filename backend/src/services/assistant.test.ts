import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { followUpsFor, refusalFor } from './assistant.js';

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

test('assistant suggests distinct source-backed follow-up questions', () => {
  const followUps = followUpsFor(
    [
      { a: { id: 'cara', title: 'What is CARA?' }, s: 4 },
      { a: { id: 'carings', title: 'What is CARINGS?' }, s: 3 },
      { a: { id: 'cara-copy', title: 'What is CARA?' }, s: 2 },
    ],
    'Tell me about adoption',
  );
  assert.deepEqual(followUps, ['What is CARA?', 'What is CARINGS?']);
});

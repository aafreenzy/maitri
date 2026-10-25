import { describe, expect, it } from 'vitest';
import { detectStage, extractSigns, parseAnswer } from './voiceParse';
import { evaluate } from '../engine/evaluate';

describe('parseAnswer', () => {
  it.each([
    ['हाँ', 'yes'], ['हां जी', 'yes'], ['haan', 'yes'], ['Yes.', 'yes'],
    ['नहीं', 'no'], ['nahi', 'no'], ['No!', 'no'],
    ['पता नहीं', 'not_sure'], ['pata nahi', 'not_sure'], ["I don't know", 'not_sure'],
  ])('%s -> %s', (text, want) => expect(parseAnswer(text)).toBe(want));
  it('returns null for unclear or contradictory speech', () => {
    expect(parseAnswer('')).toBeNull();
    expect(parseAnswer('शायद कल')).toBeNull();
    expect(parseAnswer('हाँ नहीं')).toBeNull();
  });
  it('does not read "ha" inside another word as yes', () => {
    expect(parseAnswer('chalo')).toBeNull();
  });
});

describe('detectStage', () => {
  it('finds the stage, after birth first', () => {
    expect(detectStage('बच्चा हो गया है और खून आ रहा है')).toBe('after_birth');
    expect(detectStage('labour pains started')).toBe('labour');
    expect(detectStage('I am pregnant')).toBe('pregnant');
    expect(detectStage('मदद चाहिए')).toBeNull();
  });
});

describe('extractSigns', () => {
  it('maps bleeding in pregnancy to the pregnancy bleeding question', () => {
    const r = extractSigns('मैं गर्भवती हूँ और खून आ रहा है');
    expect(r.stage).toBe('pregnant');
    expect(r.signs['q_bleed_preg']).toBe('yes');
  });
  it('maps heavy bleeding after birth to yes and plain bleeding to not sure', () => {
    expect(extractSigns('बच्चा हो गया, बहुत खून').signs['q_bleed_pp']).toBe('yes');
    expect(extractSigns('delivered yesterday, some blood').signs['q_bleed_pp']).toBe('not_sure');
  });
  it('finds several signs in Hindi, English and Hinglish', () => {
    const r = extractSigns('pregnant hoon, sir dard aur dhundhla dikh raha hai, bukhar bhi', null);
    expect(r.signs['q_headache_vision']).toBe('yes');
    expect(r.signs['q_fever']).toBe('yes');
  });
  it('weak phrases give not sure, strong phrases give yes', () => {
    expect(extractSigns('pregnant, baby moving less').signs['q_baby_moves']).toBe('not_sure');
    expect(extractSigns('pregnant, baby not moving').signs['q_baby_moves']).toBe('yes');
  });
  it('ignores signs that do not apply to the stage', () => {
    expect(extractSigns('after birth, baby not moving').signs['q_baby_moves']).toBeUndefined();
  });
  it('a spoken RED sign evaluates to RED and a weak one escalates to AMBER, never GREEN', () => {
    const red = extractSigns('pregnant and having fits');
    expect(evaluate(red.stage!, red.signs).tier).toBe('RED');
    const weak = extractSigns('pregnant, feeling weak');
    expect(evaluate(weak.stage!, weak.signs).tier).not.toBe('GREEN');
  });
  it('finds nothing in unrelated speech', () => {
    expect(extractSigns('hello how are you', 'pregnant').signs).toEqual({});
  });
});

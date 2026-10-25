import { initialState, reducer } from './session';

describe('session reducer', () => {
  it('skip stores not_sure', () => {
    expect(reducer(initialState, { type: 'skip', id: 'q_fits' }).answers['q_fits']).toBe('not_sure');
  });
  it('back keeps earlier answers', () => {
    let s = reducer(initialState, { type: 'setStage', stage: 'pregnant' });
    s = reducer(s, { type: 'answer', id: 'q_fits', value: 'yes' });
    s = reducer(reducer(s, { type: 'next' }), { type: 'back' });
    expect(s.index).toBe(0);
    expect(s.answers['q_fits']).toBe('yes');
  });
  it('changing stage resets answers; same stage keeps them', () => {
    let s = reducer(initialState, { type: 'setStage', stage: 'pregnant' });
    s = reducer(s, { type: 'answer', id: 'q_fits', value: 'yes' });
    expect(reducer(s, { type: 'setStage', stage: 'pregnant' }).answers['q_fits']).toBe('yes');
    expect(reducer(s, { type: 'setStage', stage: 'labour' }).answers).toEqual({});
  });
  it('clearAll returns the initial state', () => {
    const s = reducer(reducer(initialState, { type: 'setMode', mode: 'asha' }), { type: 'clearAll' });
    expect(s).toEqual(initialState);
  });
});

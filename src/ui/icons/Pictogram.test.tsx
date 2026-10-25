import { data } from '../../engine/loadData';
import { ICONS } from './registry';

it('registry has every icon id used by questions, stages and modes', () => {
  const ids = [...data.questions.map((q) => q.icon), ...data.stages.map((s) => s.icon), 'mode-woman', 'mode-asha', 'mode-family'];
  for (const id of ids) expect(ICONS[id], id).toBeDefined();
});

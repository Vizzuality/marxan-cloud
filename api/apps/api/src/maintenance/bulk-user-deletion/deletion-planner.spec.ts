import {
  classifyProjects,
  choosePromotionTarget,
  ProjectMembership,
  ProjectRole,
} from './deletion-planner';

const D = new Set(['del1', 'del2']);
const proj = (
  id: string,
  members: Array<[string, ProjectRole]>,
  createdBy: string | null = null,
): ProjectMembership => ({
  projectId: id,
  createdBy,
  members: members.map(([userId, role]) => ({ userId, role })),
});

describe('classifyProjects', () => {
  it('A = zero members (report only)', () => {
    const r = classifyProjects([proj('a', [])], D);
    expect(r.alreadyOrphaned.map((p) => p.projectId)).toEqual(['a']);
    expect(r.becomesOrphaned).toEqual([]);
    expect(r.kept).toEqual([]);
  });
  it('B = all members are deletees', () => {
    const r = classifyProjects(
      [proj('b', [['del1', 'project_owner'], ['del2', 'project_viewer']])],
      D,
    );
    expect(r.becomesOrphaned.map((p) => p.projectId)).toEqual(['b']);
  });
  it('C = at least one surviving member (even a viewer)', () => {
    const r = classifyProjects(
      [proj('c', [['del1', 'project_owner'], ['keep1', 'project_viewer']])],
      D,
    );
    expect(r.kept.map((p) => p.projectId)).toEqual(['c']);
    expect(r.becomesOrphaned).toEqual([]);
  });
});

describe('choosePromotionTarget', () => {
  it('null when a surviving owner already exists', () => {
    expect(
      choosePromotionTarget(
        proj('p', [['keep1', 'project_owner'], ['del1', 'project_viewer']]),
        D,
      ),
    ).toBeNull();
  });
  it('promotes a surviving contributor over a surviving viewer', () => {
    const p = proj('p', [
      ['del1', 'project_owner'],
      ['v', 'project_viewer'],
      ['c', 'project_contributor'],
    ]);
    expect(choosePromotionTarget(p, D)).toEqual({
      userId: 'c',
      fromRole: 'project_contributor',
    });
  });
  it('falls back to a surviving viewer, deterministic by userId', () => {
    const p = proj('p', [
      ['del1', 'project_owner'],
      ['v2', 'project_viewer'],
      ['v1', 'project_viewer'],
    ]);
    expect(choosePromotionTarget(p, D)).toEqual({
      userId: 'v1',
      fromRole: 'project_viewer',
    });
  });
});

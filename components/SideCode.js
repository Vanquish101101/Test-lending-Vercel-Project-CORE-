'use client';

const SNIPPET = `const core = await Project.init('C.O.R.E');
for (const node of grid.nodes) {
  node.bind(theme).animate({ glow: true });
}
function think(input) {
  return input.map(reflect).filter(truth);
}
class Mind extends Reality {
  observe() { return this.inner === this.outer; }
}
await deploy({ target: 'vercel', prod: true });
render(<Universe stars={1800} planet="earth" />);
// познай себя — и познаешь всё
git.commit('Test Landing Vercel [Project CORE]');
const flow = pipe(marketing, design, audio, video);
export default function Core() { return <Grid live />; }
`;

export default function SideCode() {
  const doubled = SNIPPET + SNIPPET;
  return (
    <>
      <div className="sidecode left" aria-hidden><pre>{doubled}</pre></div>
      <div className="sidecode right" aria-hidden><pre>{doubled}</pre></div>
    </>
  );
}

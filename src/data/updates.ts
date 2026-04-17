export interface Update {
  id: string;
  date: string;
  title: string;
  body: string;
  tag?: "new" | "improvement" | "fix" | "announcement";
}

export const updates: Update[] = [
  {
    id: "openmhz-and-dedicated-network",
    date: "April 16, 2025",
    title: "New Audio Infrastructure: OpenMHz & Future Plans",
    body: "After extensive research into audio sourcing options, we've made a deliberate decision to partner with OpenMHz, an open-source platform built specifically for streaming and archiving public safety radio communications. OpenMHz gives us full transparency into how audio is captured and delivered, the flexibility to build on top of an open ecosystem, and a community-driven foundation that aligns with what ToneOut is all about. We believe open-source infrastructure is the right way to build tools for first responders and the communities they serve.\n\nRadioReference has paused new commercial API licenses due to an unprecedented surge in demand driven by AI products. We respect their decision and wish them well, but honestly, this pushed us toward something even better.\n\nLooking ahead, we're also researching what it would take to run our own dedicated feed infrastructure. The early plan is to start small, testing in our own town first, and learn from there. Down the road, we'd love to make it possible for others to set up their own nodes, whether through a kit list or a simple guide. Nothing is set in stone yet, but the long-term vision is to give ToneOut its own independent coverage that doesn't rely entirely on third-party providers.\n\nThat kind of independence is what will set ToneOut apart from every other scanner app out there. We're taking it one step at a time, but we're building toward something bigger. Stay tuned.",
    tag: "announcement",
  },
  {
    id: "welcome",
    date: "April 15, 2026",
    title: "Welcome to ToneOut Updates",
    body: "This is where we'll post development progress, new features, and announcements. Stay tuned as we build ToneOut, the scanner and push-to-talk app designed for first responders.",
    tag: "announcement",
  },
];

const GridBackground = () => {
  return (
    <div className="fixed inset-0 -z-1">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background"></div>
      <div className="absolute inset-0 bg-[linear-gradient(var(--cyber-grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--cyber-grid-color)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
    </div>
  );
};

export default GridBackground;

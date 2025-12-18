const Loader = ({ text = 'Cargando...' }) => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <p className="text-xl">{text}</p>
  </div>
);

export default Loader;

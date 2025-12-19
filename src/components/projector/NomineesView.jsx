import React from 'react';

const NomineesView = ({ category, nominees, onBack, onShowWinner }) => {
  // 1) Sin categoría → mensaje fijo
  if (!category) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-2xl">Selecciona una categoría primero.</p>
      </div>
    );
  }

  // 2) Estado "cargando" controlado desde ProjectorView:
  if (nominees === null || nominees === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-2">Cargando nominados...</p>
      </div>
    );
  }

  // 3) Sin nominados para esa categoría
  if (nominees.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center ">
        <p className="text-xl mb-2">No hay nominados asignados a esta categoría.</p>
      </div>
    );
  }

  // 4) Grid optimizado: menos espacio perdido, pensado para 4–6 en proyector cuadrado
  const getGridClasses = (count) => {
    if (count === 4) {
      return 'grid grid-cols-4 gap-x-6 gap-y-4 justify-items-center';
    }
    if (count === 5) {
      return 'grid grid-cols-5 gap-x-4 gap-y-4 justify-items-center';
    }
    if (count === 6) {
      return 'grid grid-cols-6 gap-x-4 gap-y-4 justify-items-center';
    }
    if (count === 13) {
      return 'grid grid-cols-7 gap-x-3 gap-y-3 justify-items-center';
    }

    const cols = Math.ceil(Math.sqrt(count));
    return `grid grid-cols-${Math.min(cols, 6)} gap-x-4 gap-y-4 justify-items-center`;
  };

  // 5) Tamaños de foto (círculo) grandes para que se vean bien en el beam
  const getCardClasses = (count) => {
    if (count === 4) {
      // Muy grande
      return 'w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-lg mb-3';
    }
    if (count === 5) {
      return 'w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-lg mb-3';
    }
    if (count === 6) {
      return 'w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-lg mb-3';
    }
    if (count === 13) {
      return 'w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-3 border-yellow-400/70 shadow-lg mb-2';
    }
    // Por defecto: tamaño grande
    return 'w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-yellow-400/70 shadow-lg mb-3';
  };

  // 6) Tamaño de texto según cantidad
  const getTextSize = (count) => {
    if (count === 13) {
      return 'text-lg md:text-xl';
    }
    return 'text-2xl md:text-3xl lg:text-4xl';
  };

  // 7) Vista con nominados, adaptada a formato cuadrado
  return (
    <div className="min-h-screen w-screen from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col overflow-hidden bg-[url('/images/2.png')] bg-cover bg-center bg-no-repeat">
      {/* HEADER más compacto para dejar más área a los nominados */}
      <header className="flex-shrink-0 px-4 md:px-6 pt-6 pb-3 flex flex-col items-center text-center">
        <p className="text-sm tracking-[0.35em] uppercase text-3xl md:text-4xl font-medium font-sans mb-1">
          Premio
        </p>

        <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#eccf58] drop-shadow-2xl mt-1 font-sans leading-tight">
          {category.name}
        </h1>

        <p className="text-slate-200/80 mt-1 text-xl md:text-2xl lg:text-3xl font-medium max-w-2xl font-sans leading-tight">
          Nominados oficiales para esta categoría.
        </p>
      </header>

      {/* LISTA DE NOMINADOS – contenedor casi cuadrado, sin distorsionar fondo */}
      <main className="flex-1 px-2 md:px-6 pb-6 flex items-center justify-center">
        <div className="w-full h-full max-w-[95vw] max-h-[95vh] aspect-square flex items-center justify-center p-2 md:p-4">
          <div className={`w-full h-full ${getGridClasses(nominees.length)} items-center justify-items-center`}>
            {nominees.map((nominee) => (
              <div
                key={nominee.id}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10
                           hover:bg-white/10 hover:border-yellow-400/60 transition-all duration-200
                           shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col items-center 
                           justify-center px-4 py-6"
              >
                {/* FOTO CIRCULAR GRANDE */}
                <div className={getCardClasses(nominees.length)}>
                  <img
                    src={nominee.img_url}
                    alt={nominee.name}
                    className="w-full h-full object-cover object-center rounded-full"
                    loading="lazy"
                  />
                </div>

                {/* NOMBRE DEL NOMINADO */}
                <h2
                  className={`
                    [-webkit-text-stroke:1.5px_rgba(0,0,0,0.8)]
                    font-bold text-center font-sans drop-shadow-lg shadow-black
                    ${getTextSize(nominees.length)} mt-1 md:mt-2 leading-tight px-1 md:px-2
                    group-hover:text-yellow-300 transition-colors duration-200
                  `}
                >
                  {nominee.name}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NomineesView;

const NomineesGrid = ({ 
  nominees, 
  selectedNomineeId, 
  onVote, 
  sendingVote, 
  alreadyVoted, 
  loadingNominees 
}) => {
  if (loadingNominees) {
    return <p className="text-slate-300">Cargando nominados...</p>;
  }

  if (!nominees.length) {
    return (
      <p className="col-span-full text-slate-300">
        No hay nominados para esta categoría.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {nominees.map((nominee) => (
        <button
          key={nominee.id}
          onClick={() => onVote(nominee.id)}
          disabled={sendingVote || alreadyVoted}
          className={`group rounded-2xl bg-white/5 border ${
            selectedNomineeId === nominee.id
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-white/10'
          } p-4 flex flex-col items-center text-center hover:bg-white/10 hover:border-yellow-400/60 transition ${
            alreadyVoted ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-300 mb-3">
            <img
              src={nominee.img_url}
              alt={nominee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-yellow-100">{nominee.name}</span>
        </button>
      ))}
    </div>
  );
};

export default NomineesGrid;

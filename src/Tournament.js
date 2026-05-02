import React from 'react';

const Tournament = ({ tournament, onStart }) => {
  const startDate = new Date(tournament.start_date * 1000).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const endDate = new Date(tournament.end_date * 1000).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleStartClick = (e) => {
    e.stopPropagation();
    onStart(tournament._id);
  };

  return (
    <div className="tournament-card">
      <div className="card-header">
        <div className="title-section">
          <span className="icon">📋</span>
          <h3 className="title">{tournament.title}</h3>
        </div>
        <div className="badges">
          {tournament.status === 'Registration' && <span className="badge open">Відкрита</span>}
          <span className="badge mandatory">Обов'язкова</span>
          {tournament.is_registered && <span className="badge registered">Зареєстрований (-а)</span>}
        </div>
      </div>
      <div className="card-body">
        <div className="info-row"><span className="label">Початок</span><span className="value">{startDate}</span></div>
        <div className="info-row"><span className="label">Завершення</span><span className="value">{endDate}</span></div>
      </div>
      <div className="card-footer">
        <button className="btn-primary" onClick={handleStartClick} disabled={tournament.status !== 'Registration' && tournament.status !== 'Running'}>
          Почати турнір
        </button>
        <button className="btn-secondary" onClick={(e) => e.stopPropagation()}>Вийти із сесії</button>
      </div>
    </div>
  );
};

export default Tournament;